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

const DAILY_XP_GOAL = 90;
const XP_PER_CORRECT = 12;
const XP_COMBO_BONUS = 8;
const GEMS_PER_CORRECT = 3;
const STORAGE_KEY = "armenian-duo-progress-v3";
const THEME_KEY = "armenian-duo-theme";

const el = {
  root: document.documentElement,
  themeToggle: document.getElementById("themeToggle"),
  pathNodes: document.getElementById("pathNodes"),
  streak: document.getElementById("streak"),
  xp: document.getElementById("xp"),
  gems: document.getElementById("gems"),
  questFill: document.getElementById("questFill"),
  questText: document.getElementById("questText"),
  progressFill: document.getElementById("progressFill"),
  progressText: document.getElementById("progressText"),
  masteryText: document.getElementById("masteryText"),
  lessonTitle: document.getElementById("lessonTitle"),
  lessonTag: document.getElementById("lessonTag"),
  prompt: document.getElementById("prompt"),
  hint: document.getElementById("hint"),
  choices: document.getElementById("choices"),
  skipBtn: document.getElementById("skipBtn"),
  nextBtn: document.getElementById("nextBtn"),
  feedback: document.getElementById("feedback"),
  phraseList: document.getElementById("phraseList"),
  resetProgressBtn: document.getElementById("resetProgressBtn"),
};

const state = {
  activeLessonIndex: null,
  answered: false,
  completed: new Set(),
  unlockedCount: 1,
  streak: 1,
  xp: 0,
  gems: 0,
  combo: 0,
};

function saveProgress() {
  const data = {
    completed: [...state.completed],
    unlockedCount: state.unlockedCount,
    streak: state.streak,
    xp: state.xp,
    gems: state.gems,
    combo: state.combo,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadProgress() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const data = JSON.parse(raw);
    state.completed = new Set(data.completed || []);
    state.unlockedCount = Math.min(lessons.length, Math.max(1, Number(data.unlockedCount) || 1));
    state.streak = Math.max(1, Number(data.streak) || 1);
    state.xp = Math.max(0, Number(data.xp) || 0);
    state.gems = Math.max(0, Number(data.gems) || 0);
    state.combo = Math.max(0, Number(data.combo) || 0);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  el.root.setAttribute("data-theme", nextTheme);
  el.themeToggle.textContent = nextTheme === "dark" ? "Ljust läge" : "Mörkt läge";
  localStorage.setItem(THEME_KEY, nextTheme);
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

function fillPhraseList() {
  el.phraseList.innerHTML = "";
  lessons.forEach((lesson) => {
    const li = document.createElement("li");
    li.textContent = `${lesson.sv} → ${lesson.hy} (${lesson.pronunciation})`;
    el.phraseList.appendChild(li);
  });
}

function setFeedback(message, type = "info") {
  el.feedback.textContent = message;
  el.feedback.className = `feedback ${type}`;
}

function getMastery() {
  return Math.round((state.completed.size / lessons.length) * 100);
}

function updateStats() {
  el.streak.textContent = String(state.streak);
  el.xp.textContent = String(state.xp);
  el.gems.textContent = String(state.gems);

  const questPct = Math.min(100, (state.xp / DAILY_XP_GOAL) * 100);
  el.questFill.style.width = `${questPct}%`;
  el.questText.textContent = `${state.xp} / ${DAILY_XP_GOAL} XP`;

  const progressPct = (state.completed.size / lessons.length) * 100;
  el.progressFill.style.width = `${progressPct}%`;
  el.progressText.textContent = `${state.completed.size} / ${lessons.length}`;
  el.masteryText.textContent = `Mastery: ${getMastery()}%`;
}

function buildPath() {
  el.pathNodes.innerHTML = "";

  lessons.forEach((lesson, index) => {
    const button = document.createElement("button");
    button.type = "button";

    const isCompleted = state.completed.has(lesson.id);
    const isUnlocked = index < state.unlockedCount;
    const isActive = state.activeLessonIndex === index;

    button.className = "path-node";
    button.classList.add(index % 2 === 0 ? "left" : "right");

    if (isCompleted) {
      button.classList.add("completed");
      button.textContent = "✓";
    } else if (isUnlocked) {
      button.classList.add("unlocked");
      button.textContent = "●";
    } else {
      button.classList.add("locked");
      button.textContent = "•";
      button.disabled = true;
    }

    if (isActive) {
      button.classList.add("active");
    }

    const label = document.createElement("span");
    label.className = "path-label";
    label.textContent = index === 0 ? "START" : `LEKTION ${lesson.id}`;
    button.appendChild(label);

    if (isUnlocked) {
      button.addEventListener("click", () => startLesson(index));
    }

    el.pathNodes.appendChild(button);
  });
}

function startLesson(index) {
  if (index >= state.unlockedCount) {
    return;
  }

  state.activeLessonIndex = index;
  state.answered = false;
  const lesson = lessons[index];

  el.lessonTitle.textContent = `Lektion ${lesson.id}: ${lesson.sv}`;
  el.lessonTag.textContent = "Välj rätt armeniska";
  el.prompt.textContent = `Hur säger man "${lesson.sv}" på armeniska?`;
  el.hint.textContent = `Tips: ${lesson.hint} • Uttal: ${lesson.pronunciation}`;
  el.choices.innerHTML = "";

  lesson.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-btn";
    button.textContent = choice;
    button.addEventListener("click", () => chooseAnswer(button, choice));
    el.choices.appendChild(button);
  });

  el.skipBtn.disabled = false;
  el.nextBtn.disabled = true;
  setFeedback("", "info");
  buildPath();
}

function chooseAnswer(button, selectedChoice) {
  if (state.activeLessonIndex === null || state.answered) {
    return;
  }

  state.answered = true;
  const lesson = lessons[state.activeLessonIndex];
  const buttons = [...document.querySelectorAll(".choice-btn")];

  buttons.forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === lesson.hy) {
      btn.classList.add("correct");
    }
  });

  if (selectedChoice === lesson.hy) {
    state.xp += XP_PER_CORRECT;
    state.gems += GEMS_PER_CORRECT;
    state.streak += 1;
    state.combo += 1;

    if (!state.completed.has(lesson.id)) {
      state.completed.add(lesson.id);
      state.unlockedCount = Math.min(lessons.length, state.unlockedCount + 1);
    }

    let message = `Rätt! +${XP_PER_CORRECT} XP och +${GEMS_PER_CORRECT} gems.`;
    if (state.combo % 3 === 0) {
      state.xp += XP_COMBO_BONUS;
      message += ` Combo bonus +${XP_COMBO_BONUS} XP.`;
    }
    if (state.xp >= DAILY_XP_GOAL) {
      message += " Daily quest klar.";
    }

    setFeedback(message, "good");
  } else {
    button.classList.add("wrong");
    state.combo = 0;
    state.streak = Math.max(1, state.streak - 1);
    setFeedback(`Fel. Rätt svar är "${lesson.hy}".`, "bad");
  }

  el.nextBtn.disabled = false;
  updateStats();
  buildPath();
  saveProgress();
}

function clearLessonPanel(message = "Fortsätt med nästa nod i banan.") {
  el.choices.innerHTML = "";
  el.skipBtn.disabled = true;
  el.nextBtn.disabled = true;
  state.activeLessonIndex = null;
  setFeedback(message, "good");
}

function goNext() {
  if (state.activeLessonIndex === null) {
    return;
  }

  const nextIndex = state.activeLessonIndex + 1;
  if (nextIndex < state.unlockedCount && nextIndex < lessons.length) {
    startLesson(nextIndex);
    return;
  }

  el.lessonTitle.textContent = "Unit 1 klar";
  el.lessonTag.textContent = "Bra jobbat";
  el.prompt.textContent = "Du har slutfört alla upplåsta noder i enheten.";
  el.hint.textContent = "Repetera noder för bättre streak och högre mastery.";
  clearLessonPanel("Snyggt jobbat! Träna valfri upplåst nod för mer XP.");
  buildPath();
}

function skipCurrent() {
  if (state.activeLessonIndex === null || state.answered) {
    return;
  }

  state.combo = 0;
  state.streak = Math.max(1, state.streak - 1);
  setFeedback("Frågan hoppades över. Ingen XP för denna nod.", "info");
  goNext();
  updateStats();
  saveProgress();
}

function resetProgress() {
  state.activeLessonIndex = null;
  state.answered = false;
  state.completed = new Set();
  state.unlockedCount = 1;
  state.streak = 1;
  state.xp = 0;
  state.gems = 0;
  state.combo = 0;

  localStorage.removeItem(STORAGE_KEY);

  el.lessonTitle.textContent = "Starta en lektion";
  el.lessonTag.textContent = "Välj nod";
  el.prompt.textContent = "Klicka på en upplåst nod i banan för att börja.";
  el.hint.textContent = "Du får direkt feedback och kan repetera noder för högre streak.";
  clearLessonPanel("Progress återställd.");
  updateStats();
  buildPath();
}

el.nextBtn.addEventListener("click", goNext);
el.skipBtn.addEventListener("click", skipCurrent);
el.resetProgressBtn.addEventListener("click", resetProgress);
el.themeToggle.addEventListener("click", toggleTheme);

loadTheme();
loadProgress();
fillPhraseList();
updateStats();
buildPath();
