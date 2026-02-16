const lessonCards = [
  { id: 1, hy: "Բարև", sv: "hej", pronunciation: "Barev", isNew: true },
  { id: 2, hy: "Շնորհակալություն", sv: "tack", pronunciation: "Shnorhakalutjun", isNew: true },
  { id: 3, hy: "Խնդրում եմ", sv: "snälla", pronunciation: "Chntrum em", isNew: true },
  { id: 4, hy: "Այո", sv: "ja", pronunciation: "Ajo", isNew: false },
  { id: 5, hy: "Ոչ", sv: "nej", pronunciation: "Votj", isNew: false },
  { id: 6, hy: "Բարի լույս", sv: "god morgon", pronunciation: "Bari lujs", isNew: true },
  { id: 7, hy: "Բարի գիշեր", sv: "god natt", pronunciation: "Bari gisher", isNew: true },
  { id: 8, hy: "Ներեցեք", sv: "ursäkta", pronunciation: "Neretsek", isNew: true },
  { id: 9, hy: "Ինչպե՞ս ես", sv: "hur mår du", pronunciation: "Intjspes es", isNew: true },
  { id: 10, hy: "Ես լավ եմ", sv: "jag mår bra", pronunciation: "Es lav em", isNew: false },
];

const fillerWords = ["är", "du", "inte", "och", "tack", "snälla", "mår", "bra", "god", "morgon", "natt", "ja", "nej"];

const quickWords = lessonCards.map((card) => ({ sv: card.sv, hy: card.hy, isNew: card.isNew }));

const XP_PER_CORRECT = 12;
const GEMS_PER_CORRECT = 3;
const STORAGE_KEY = "armenian-duo-progress-v6";
const THEME_KEY = "armenian-duo-theme";

const el = {
  root: document.documentElement,
  homePage: document.getElementById("homePage"),
  unitPage: document.getElementById("unitPage"),
  themeToggle: document.getElementById("themeToggle"),
  streak: document.getElementById("streak"),
  xp: document.getElementById("xp"),
  gems: document.getElementById("gems"),
  enterUnitBtn: document.getElementById("enterUnitBtn"),
  quitUnitBtn: document.getElementById("quitUnitBtn"),
  questionCounter: document.getElementById("questionCounter"),
  timerText: document.getElementById("timerText"),
  armenianWordText: document.getElementById("armenianWordText"),
  showMeaningBtn: document.getElementById("showMeaningBtn"),
  wordMeaning: document.getElementById("wordMeaning"),
  hint: document.getElementById("hint"),
  answerBar: document.getElementById("answerBar"),
  wordBank: document.getElementById("wordBank"),
  clearBtn: document.getElementById("clearBtn"),
  checkBtn: document.getElementById("checkBtn"),
  nextBtn: document.getElementById("nextBtn"),
  feedback: document.getElementById("feedback"),
  unitWords: document.getElementById("unitWords"),
  resetProgressBtn: document.getElementById("resetProgressBtn"),
  entryOverlay: document.getElementById("entryOverlay"),
  loadFill: document.getElementById("loadFill"),
};

const state = {
  xp: 0,
  gems: 0,
  streak: 1,
  unitIndex: 0,
  solved: false,
  answerTokens: [],
  timerSeconds: 0,
  timerId: null,
};

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ xp: state.xp, gems: state.gems, streak: state.streak }));
}

function loadProgress() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    state.xp = Math.max(0, Number(data.xp) || 0);
    state.gems = Math.max(0, Number(data.gems) || 0);
    state.streak = Math.max(1, Number(data.streak) || 1);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function applyTheme(theme) {
  const next = theme === "dark" ? "dark" : "light";
  el.root.setAttribute("data-theme", next);
  el.themeToggle.textContent = next === "dark" ? "Ljust läge" : "Mörkt läge";
  localStorage.setItem(THEME_KEY, next);
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") return applyTheme(saved);
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

function toggleTheme() {
  applyTheme((el.root.getAttribute("data-theme") || "light") === "light" ? "dark" : "light");
}

function formatTime(totalSec) {
  const mins = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const secs = String(totalSec % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function startTimer() {
  stopTimer();
  state.timerSeconds = 0;
  el.timerText.textContent = formatTime(0);
  state.timerId = setInterval(() => {
    state.timerSeconds += 1;
    el.timerText.textContent = formatTime(state.timerSeconds);
  }, 1000);
}

function stopTimer() {
  if (!state.timerId) return;
  clearInterval(state.timerId);
  state.timerId = null;
}

function showPage(which) {
  el.homePage.classList.toggle("active", which === "home");
  el.unitPage.classList.toggle("active", which === "unit");
}

function setFeedback(message, kind = "info") {
  el.feedback.textContent = message;
  el.feedback.className = `feedback ${kind}`;
}

function updateTopStats() {
  el.streak.textContent = String(state.streak);
  el.xp.textContent = String(state.xp);
  el.gems.textContent = String(state.gems);
}

function renderQuickWords() {
  el.unitWords.innerHTML = "";
  quickWords.forEach((pair) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `word-chip ${pair.isNew ? "new-word" : "common-word"}`;
    chip.textContent = pair.sv;
    chip.setAttribute("data-translation", pair.hy);
    chip.setAttribute("aria-label", `${pair.sv} betyder ${pair.hy}`);
    el.unitWords.appendChild(chip);
  });
}

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function tokenColorClass(token, answerTokens, isNew) {
  if (isNew && answerTokens.includes(token)) return "new-word";
  return "common-word";
}

function renderAnswerBar() {
  el.answerBar.innerHTML = "";
  if (state.answerTokens.length === 0) {
    const ph = document.createElement("span");
    ph.className = "answer-placeholder";
    ph.textContent = "Tryck ordblock nedan för att bygga översättningen";
    el.answerBar.appendChild(ph);
    return;
  }

  state.answerTokens.forEach((token) => {
    const t = document.createElement("span");
    t.className = "answer-token";
    t.textContent = token;
    el.answerBar.appendChild(t);
  });
}

function renderWordBank(card) {
  const answerTokens = card.sv.split(" ");
  const distractors = fillerWords.filter((w) => !answerTokens.includes(w)).slice(0, Math.max(2, 5 - answerTokens.length));
  const bank = shuffle([...answerTokens, ...distractors]);

  el.wordBank.innerHTML = "";
  bank.forEach((word) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `word-block ${tokenColorClass(word, answerTokens, card.isNew)}`;
    btn.textContent = word;
    btn.disabled = false;

    btn.addEventListener("click", () => {
      if (state.solved) return;
      state.answerTokens.push(word);
      btn.disabled = true;
      btn.classList.add("used");
      renderAnswerBar();
      el.checkBtn.disabled = state.answerTokens.length === 0;
    });

    el.wordBank.appendChild(btn);
  });
}

function renderCard() {
  const card = lessonCards[state.unitIndex];
  state.solved = false;
  state.answerTokens = [];

  el.questionCounter.textContent = `${state.unitIndex + 1} / ${lessonCards.length}`;
  el.armenianWordText.textContent = card.hy;
  el.armenianWordText.classList.toggle("new-word", card.isNew);
  el.wordMeaning.textContent = card.sv;
  el.wordMeaning.hidden = true;
  el.hint.textContent = `Uttal: ${card.pronunciation}`;

  el.nextBtn.disabled = true;
  el.checkBtn.disabled = true;
  el.showMeaningBtn.disabled = false;

  renderAnswerBar();
  renderWordBank(card);
  setFeedback("Bygg svensk översättning med ordblock och tryck Kolla.", "info");
}

function revealMeaning() {
  el.wordMeaning.hidden = false;
}

function clearAnswer() {
  if (state.solved) return;
  state.answerTokens = [];
  const blocks = [...document.querySelectorAll('.word-block')];
  blocks.forEach((b) => {
    b.disabled = false;
    b.classList.remove("used");
  });
  renderAnswerBar();
  el.checkBtn.disabled = true;
}

function checkAnswer() {
  if (state.solved) return;
  const card = lessonCards[state.unitIndex];
  const built = state.answerTokens.join(" ").trim().toLowerCase();
  const expected = card.sv.toLowerCase();

  if (built === expected) {
    state.solved = true;
    state.xp += XP_PER_CORRECT;
    state.gems += GEMS_PER_CORRECT;
    state.streak += 1;
    updateTopStats();
    saveProgress();

    setFeedback(`Rätt! +${XP_PER_CORRECT} XP och +${GEMS_PER_CORRECT} gems.`, "good");
    el.nextBtn.disabled = false;
    el.checkBtn.disabled = true;
    el.showMeaningBtn.disabled = true;
  } else {
    state.streak = Math.max(1, state.streak - 1);
    updateTopStats();
    saveProgress();
    setFeedback(`Inte riktigt. Du byggde: "${built || "…"}"`, "bad");
  }
}

function finishUnit() {
  stopTimer();
  setFeedback(`Unit klar på ${formatTime(state.timerSeconds)}!`, "good");
  el.hint.textContent = "Tryck Avsluta Unit för att gå tillbaka till startsidan.";
  el.wordBank.innerHTML = "";
  el.answerBar.innerHTML = "";
  el.checkBtn.disabled = true;
  el.nextBtn.disabled = true;
}

function nextCard() {
  if (!state.solved) return;
  if (state.unitIndex >= lessonCards.length - 1) return finishUnit();
  state.unitIndex += 1;
  renderCard();
}

async function animateEntryAndEnterUnit() {
  el.entryOverlay.hidden = false;
  el.loadFill.style.width = "0%";
  await new Promise((resolve) => {
    requestAnimationFrame(() => {
      el.loadFill.style.transition = "width 520ms ease";
      el.loadFill.style.width = "100%";
      setTimeout(resolve, 540);
    });
  });
  el.entryOverlay.hidden = true;
  el.loadFill.style.transition = "none";
}

async function enterUnit() {
  await animateEntryAndEnterUnit();
  state.unitIndex = 0;
  showPage("unit");
  startTimer();
  renderCard();
}

function quitUnit() {
  stopTimer();
  showPage("home");
}

function resetProgress() {
  state.xp = 0;
  state.gems = 0;
  state.streak = 1;
  saveProgress();
  updateTopStats();
}

el.themeToggle.addEventListener("click", toggleTheme);
el.enterUnitBtn.addEventListener("click", enterUnit);
el.quitUnitBtn.addEventListener("click", quitUnit);
el.showMeaningBtn.addEventListener("click", revealMeaning);
el.clearBtn.addEventListener("click", clearAnswer);
el.checkBtn.addEventListener("click", checkAnswer);
el.nextBtn.addEventListener("click", nextCard);
el.resetProgressBtn.addEventListener("click", resetProgress);

loadTheme();
loadProgress();
updateTopStats();
renderQuickWords();
showPage("home");
