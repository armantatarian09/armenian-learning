"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { LessonData } from "@/lib/schema";
import { isAnswerCorrect } from "@/lib/normalize";
import { playCorrect, playDictationCue, playWrong } from "@/features/audio/sfx";
import { useAppStore } from "@/features/lesson/store";
import type { ResponseSpeed } from "@/lib/srs";
import { ConfettiBurst } from "./confetti-burst";

type Props = { lesson: LessonData };

function pickWords(lesson: LessonData) {
  return lesson.exercises.flatMap((exercise) => exercise.acceptedAnswers).slice(0, 20);
}

function getSpeed(ms: number): ResponseSpeed {
  if (ms <= 2500) return "fast";
  if (ms <= 7000) return "normal";
  return "slow";
}

export function LessonPlayer({ lesson }: Props) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [selectedPairs, setSelectedPairs] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<null | "correct" | "wrong">(null);
  const [done, setDone] = useState(false);
  const [promptStartedAt, setPromptStartedAt] = useState(() => Date.now());

  const {
    stats,
    settings,
    progress,
    useHeart,
    addXp,
    startSession,
    markLessonDone,
    addMistake,
    seedSrsItems,
    reviewSrsItem,
    clearMistake
  } = useAppStore();
  const exercise = lesson.exercises[index];
  const completed = index / lesson.exercises.length;

  const canUseMotion = !settings.reducedMotion;

  const shuffledRight = useMemo(() => {
    if (!exercise?.pairs) return [];
    return [...exercise.pairs.map((pair) => pair.right)].sort(() => Math.random() - 0.5);
  }, [exercise?.id]);

  const submit = (value: string) => {
    const correct = isAnswerCorrect(value, exercise.acceptedAnswers);
    const speed = getSpeed(Date.now() - promptStartedAt);
    reviewSrsItem(exercise.id, { correct, speed });

    if (correct) {
      clearMistake(exercise.id);
      setFeedback("correct");
      addXp(10);
      if (settings.sound) playCorrect();
      window.setTimeout(() => {
        if (index + 1 >= lesson.exercises.length) {
          setDone(true);
          addXp(30);
          markLessonDone(lesson.id, pickWords(lesson));
          seedSrsItems(lesson.exercises.map((item) => item.id));
        } else {
          setFeedback(null);
          setInput("");
          setSelectedPairs({});
          setIndex((current) => current + 1);
          setPromptStartedAt(Date.now());
        }
      }, 450);
      return;
    }

    setFeedback("wrong");
    useHeart();
    addMistake(exercise.id);
    if (settings.sound) playWrong();
  };

  const submitMatching = () => {
    const answer = Object.entries(selectedPairs)
      .sort(([leftA], [leftB]) => leftA.localeCompare(leftB))
      .map(([left, right]) => `${left}:${right}`)
      .join("|");

    const accepted = exercise.acceptedAnswers
      .map((entry) => entry.split(":"))
      .sort(([leftA], [leftB]) => leftA.localeCompare(leftB))
      .map(([left, right]) => `${left}:${right}`)
      .join("|");

    submit(answer === accepted ? accepted : answer);
  };

  if (done) {
    return (
      <section className="page-card lesson-shell" style={{ position: "relative" }}>
        {canUseMotion && <ConfettiBurst />}
        <h1 className="page-header">Lesson complete! 🎉</h1>
        <p>You finished {lesson.title}. Great work.</p>
        <p>
          XP: <strong>{stats.xp}</strong> · Streak: <strong>{stats.streak}</strong>
        </p>
      </section>
    );
  }

  return (
    <section className="lesson-shell">
      <div className="lesson-main page-card" aria-live="polite">
        <div className="progress-row">
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Lesson progress"
            aria-valuenow={index + 1}
            aria-valuemin={0}
            aria-valuemax={lesson.exercises.length}
          >
            <span style={{ width: `${completed * 100}%` }} />
          </div>
          <strong>
            {index + 1}/{lesson.exercises.length}
          </strong>
        </div>
        <h1 className="page-header">{exercise.prompt}</h1>
        {settings.transliteration && exercise.transliteration ? (
          <p className="muted">{exercise.transliteration}</p>
        ) : null}

        {exercise.type === "multiple-choice" || exercise.type === "alphabet" ? (
          <div className="options-grid">
            {exercise.options?.map((option) => (
              <button
                key={option}
                type="button"
                className="choice"
                onClick={() => submit(option)}
                aria-label={`Choose ${option}`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : null}

        {exercise.type === "word-tiles" ? (
          <>
            <div className="options-grid">
              {exercise.tiles?.map((tile) => (
                <button
                  key={tile}
                  type="button"
                  className="choice"
                  onClick={() => setInput((current) => `${current} ${tile}`.trim())}
                >
                  {tile}
                </button>
              ))}
            </div>
            <input
              aria-label="Built sentence"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="text-input"
            />
            <button type="button" className="primary-btn" onClick={() => submit(input)}>
              Check
            </button>
          </>
        ) : null}

        {exercise.type === "dictation" ? (
          <>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                className="choice"
                onClick={() => playDictationCue(exercise.audioRef)}
                aria-label="Play dictation audio"
              >
                ▶ Play audio
              </button>
              <button type="button" className="choice" onClick={startSession}>
                Start streak
              </button>
            </div>
            <input
              aria-label="Type what you hear"
              className="text-input"
              placeholder="Type Armenian here"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && submit(input)}
            />
            <button type="button" className="primary-btn" onClick={() => submit(input)}>
              Check
            </button>
          </>
        ) : null}

        {exercise.type === "matching" ? (
          <>
            <div className="matching-grid">
              <div>
                {exercise.pairs?.map((pair) => (
                  <div key={pair.left} className="match-cell">
                    {pair.left}
                  </div>
                ))}
              </div>
              <div>
                {shuffledRight.map((right) => (
                  <button
                    key={right}
                    type="button"
                    className="choice"
                    onClick={() => {
                      const nextUnselected = exercise.pairs?.find(
                        (pair) => !selectedPairs[pair.left]
                      );
                      if (nextUnselected) {
                        setSelectedPairs((current) => ({ ...current, [nextUnselected.left]: right }));
                      }
                    }}
                  >
                    {right}
                  </button>
                ))}
              </div>
            </div>
            <button type="button" className="primary-btn" onClick={submitMatching}>
              Check pairs
            </button>
          </>
        ) : null}

        {feedback ? (
          <motion.p
            initial={canUseMotion ? { opacity: 0, y: 8 } : false}
            animate={canUseMotion ? { opacity: 1, y: 0 } : {}}
            className={feedback === "correct" ? "ok" : "bad"}
          >
            {feedback === "correct" ? "Correct!" : "Not quite — try again."}
          </motion.p>
        ) : null}
      </div>

      <aside className="lesson-side page-card">
        <h2>Progress</h2>
        <p>❤️ Hearts: {stats.hearts}</p>
        <p>⭐ XP: {stats.xp}</p>
        <p>🔥 Streak: {stats.streak}</p>
        <h3>Tip</h3>
        <p className="muted">{lesson.tip}</p>
        <h3>Words learned</h3>
        <p className="muted">{progress.wordsLearned.length}</p>
      </aside>
    </section>
  );
}
