const lessonCards = [
  { id: 1, hy: "Բարև", sv: "Hej", pronunciation: "Barev", isNew: true },
  { id: 2, hy: "Շնորհակալություն", sv: "Tack", pronunciation: "Shnorhakalutjun", isNew: true },
  { id: 3, hy: "Խնդրում եմ", sv: "Snälla / Varsågod", pronunciation: "Chntrum em", isNew: true },
  { id: 4, hy: "Այո", sv: "Ja", pronunciation: "Ajo", isNew: false },
  { id: 5, hy: "Ոչ", sv: "Nej", pronunciation: "Votj", isNew: false },
  { id: 6, hy: "Բարի լույս", sv: "God morgon", pronunciation: "Bari lujs", isNew: true },
  { id: 7, hy: "Բարի գիշեր", sv: "God natt", pronunciation: "Bari gisher", isNew: true },
  { id: 8, hy: "Ներեցեք", sv: "Ursäkta", pronunciation: "Neretsek", isNew: true },
  { id: 9, hy: "Ինչպե՞ս ես", sv: "Hur mår du?", pronunciation: "Intjspes es", isNew: true },
  { id: 10, hy: "Ես լավ եմ", sv: "Jag mår bra", pronunciation: "Es lav em", isNew: false },
];

const quickWords = lessonCards.map((card) => ({ sv: card.sv.toLowerCase(), hy: card.hy, isNew: card.isNew }));

const XP_PER_REVEAL = 12;
const GEMS_PER_REVEAL = 3;
const STORAGE_KEY = "armenian-duo-progress-v5";
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
  armenianWordBtn: document.getElementById("armenianWordBtn"),
  wordMeaning: document.getElementById("wordMeaning"),
  hint: document.getElementById("hint"),
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
  revealed: false,
  timerSeconds: 0,
  timerId: null,
};

function saveProgress() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      xp: state.xp,
      gems: state.gems,
      streak: state.streak,
    }),
  );
}

function loadProgress() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

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
  if (saved === "dark" || saved === "light") {
    applyTheme(saved);
    return;
  }

  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

function toggleTheme() {
  const current = el.root.getAttribute("data-theme") || "light";
  applyTheme(current === "light" ? "dark" : "light");
}

function formatTime(totalSec) {
  const mins = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const secs = String(totalSec % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function startTimer() {
  stopTimer();
  state.timerSeconds = 0;
  el.timerText.textContent = formatTime(state.timerSeconds);
  state.timerId = setInterval(() => {
    state.timerSeconds += 1;
    el.timerText.textContent = formatTime(state.timerSeconds);
  }, 1000);
}

function stopTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
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

function renderCard() {
  const card = lessonCards[state.unitIndex];

  el.questionCounter.textContent = `${state.unitIndex + 1} / ${lessonCards.length}`;
  el.armenianWordBtn.textContent = card.hy;
  el.armenianWordBtn.classList.toggle("new-word", card.isNew);
  el.wordMeaning.textContent = `${card.sv}`;
  el.wordMeaning.hidden = true;
  el.hint.textContent = `Uttal: ${card.pronunciation}`;
  el.nextBtn.disabled = true;
  state.revealed = false;

  setFeedback("Tryck på ordet för att se svensk översättning.", "info");
}

function revealMeaning() {
  if (state.revealed) {
    return;
  }

  state.revealed = true;
  el.wordMeaning.hidden = false;

  state.xp += XP_PER_REVEAL;
  state.gems += GEMS_PER_REVEAL;
  state.streak += 1;
  updateTopStats();
  saveProgress();

  setFeedback(`Bra! +${XP_PER_REVEAL} XP och +${GEMS_PER_REVEAL} gems.`, "good");
  el.nextBtn.disabled = false;
}

function finishUnit() {
  stopTimer();
  setFeedback(`Unit klar på ${formatTime(state.timerSeconds)}!`, "good");
  el.hint.textContent = "Tryck Avsluta Unit för att gå tillbaka till startsidan.";
  el.nextBtn.disabled = true;
  el.armenianWordBtn.disabled = true;
}

function nextCard() {
  if (!state.revealed) {
    return;
  }

  if (state.unitIndex >= lessonCards.length - 1) {
    finishUnit();
    return;
  }

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
  el.armenianWordBtn.disabled = false;
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
el.armenianWordBtn.addEventListener("click", revealMeaning);
el.nextBtn.addEventListener("click", nextCard);
el.resetProgressBtn.addEventListener("click", resetProgress);

loadTheme();
loadProgress();
updateTopStats();
renderQuickWords();
showPage("home");
