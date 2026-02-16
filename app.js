const lessons = [
  { id: 1, sv: "Hej", hy: "Բարև", pronunciation: "Barev", hint: "Vanlig hälsning.", choices: ["Բարև", "Շնորհակալություն", "Ոչ", "Այո"] },
  { id: 2, sv: "Tack", hy: "Շնորհակալություն", pronunciation: "Shnorhakalutjun", hint: "Används för att tacka.", choices: ["Խնդրում եմ", "Շնորհակալություն", "Բարի լույս", "Բարև"] },
  { id: 3, sv: "Snälla / Varsågod", hy: "Խնդրում եմ", pronunciation: "Chntrum em", hint: "Två ord.", choices: ["Խնդրում եմ", "Այո", "Ոչ", "Ներեցեք"] },
  { id: 4, sv: "Ja", hy: "Այո", pronunciation: "Ajo", hint: "Kort bekräftelse.", choices: ["Այո", "Ոչ", "Բարև", "Բարի գիշեր"] },
  { id: 5, sv: "Nej", hy: "Ոչ", pronunciation: "Votj", hint: "Kort avslag.", choices: ["Շնորհակալություն", "Ոչ", "Այո", "Բարև"] },
  { id: 6, sv: "God morgon", hy: "Բարի լույս", pronunciation: "Bari lujs", hint: "Börjar med Բարի.", choices: ["Բարի գիշեր", "Բարի լույս", "Բարև", "Ներեցեք"] },
  { id: 7, sv: "God natt", hy: "Բարի գիշեր", pronunciation: "Bari gisher", hint: "Liknar god morgon men annat andra ord.", choices: ["Բարի լույս", "Բարի գիշեր", "Խնդրում եմ", "Ոչ"] },
  { id: 8, sv: "Ursäkta", hy: "Ներեցեք", pronunciation: "Neretsek", hint: "Artigt sätt att få uppmärksamhet.", choices: ["Ներեցեք", "Շնորհակալություն", "Բարև", "Այո"] },
  { id: 9, sv: "Hur mår du?", hy: "Ինչպե՞ս ես", pronunciation: "Intjspes es", hint: "Fråga om hur någon mår.", choices: ["Ես լավ եմ", "Ինչպե՞ս ես", "Բարի լույս", "Ոչ"] },
  { id: 10, sv: "Jag mår bra", hy: "Ես լավ եմ", pronunciation: "Es lav em", hint: "Svar på hur-frågan.", choices: ["Ես լավ եմ", "Ներեցեք", "Բարև", "Շնորհակալություն"] },
];

const unitWordPairs = [
  { sv: "hej", hy: "բարև" },
  { sv: "tack", hy: "շնորհակալություն" },
  { sv: "ja", hy: "այո" },
  { sv: "nej", hy: "ոչ" },
  { sv: "snälla", hy: "խնդրում եմ" },
  { sv: "ursäkta", hy: "ներեցեք" },
  { sv: "god morgon", hy: "բարի լույս" },
  { sv: "god natt", hy: "բարի գիշեր" },
  { sv: "hur mår du", hy: "ինչպե՞ս ես" },
  { sv: "jag mår bra", hy: "ես լավ եմ" },
];

const XP_PER_CORRECT = 12;
const GEMS_PER_CORRECT = 3;
const STORAGE_KEY = "armenian-duo-progress-v4";
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
  prompt: document.getElementById("prompt"),
  hint: document.getElementById("hint"),
  choices: document.getElementById("choices"),
  nextBtn: document.getElementById("nextBtn"),
  feedback: document.getElementById("feedback"),
  phraseList: document.getElementById("phraseList"),
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
  answered: false,
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

function renderUnitWords() {
  el.unitWords.innerHTML = "";
  unitWordPairs.forEach((pair) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "word-chip";
    chip.textContent = pair.sv;
    chip.setAttribute("data-translation", pair.hy);
    chip.setAttribute("aria-label", `${pair.sv} betyder ${pair.hy}`);
    el.unitWords.appendChild(chip);
  });
}

function renderPhraseList() {
  el.phraseList.innerHTML = "";
  lessons.forEach((lesson) => {
    const li = document.createElement("li");
    li.textContent = `${lesson.sv} → ${lesson.hy} (${lesson.pronunciation})`;
    el.phraseList.appendChild(li);
  });
}

function renderQuestion() {
  const lesson = lessons[state.unitIndex];
  el.questionCounter.textContent = `${state.unitIndex + 1} / ${lessons.length}`;
  el.prompt.textContent = `Hur säger man "${lesson.sv}" på armeniska?`;
  el.hint.textContent = `Tips: ${lesson.hint} • Uttal: ${lesson.pronunciation}`;
  el.choices.innerHTML = "";
  el.nextBtn.disabled = true;
  state.answered = false;
  setFeedback("", "info");

  lesson.choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn";
    btn.textContent = choice;
    btn.addEventListener("click", () => answerQuestion(btn, choice, lesson.hy));
    el.choices.appendChild(btn);
  });
}

function answerQuestion(button, selected, correct) {
  if (state.answered) {
    return;
  }

  state.answered = true;
  const all = [...document.querySelectorAll(".choice-btn")];
  all.forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === correct) {
      btn.classList.add("correct");
    }
  });

  if (selected === correct) {
    state.xp += XP_PER_CORRECT;
    state.gems += GEMS_PER_CORRECT;
    state.streak += 1;
    setFeedback(`Rätt! +${XP_PER_CORRECT} XP och +${GEMS_PER_CORRECT} gems.`, "good");
  } else {
    button.classList.add("wrong");
    state.streak = Math.max(1, state.streak - 1);
    setFeedback(`Fel. Rätt svar: ${correct}`, "bad");
  }

  el.nextBtn.disabled = false;
  updateTopStats();
  saveProgress();
}

function finishUnit() {
  stopTimer();
  setFeedback(`Unit klar på ${formatTime(state.timerSeconds)}!`, "good");
  el.prompt.textContent = "Bra jobbat! Du klarade Unit 1.";
  el.hint.textContent = "Tryck Avsluta Unit för att gå tillbaka till startsidan.";
  el.choices.innerHTML = "";
  el.nextBtn.disabled = true;
}

function nextQuestion() {
  if (!state.answered) {
    return;
  }

  if (state.unitIndex >= lessons.length - 1) {
    finishUnit();
    return;
  }

  state.unitIndex += 1;
  renderQuestion();
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
  renderQuestion();
}

function quitUnit() {
  stopTimer();
  showPage("home");
  setFeedback("", "info");
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
el.nextBtn.addEventListener("click", nextQuestion);
el.resetProgressBtn.addEventListener("click", resetProgress);

loadTheme();
loadProgress();
updateTopStats();
renderUnitWords();
renderPhraseList();
showPage("home");
