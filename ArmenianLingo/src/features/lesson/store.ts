"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createSrsItem, isDueNow, updateSrsItem, type ResponseSpeed, type SrsItem } from "@/lib/srs";

type SettingsState = {
  transliteration: boolean;
  sound: boolean;
  reducedMotion: boolean;
  dailyGoal: number;
};

type LessonProgress = {
  completedLessons: string[];
  wordsLearned: string[];
  mistakes: string[];
};

type StatsState = {
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  hearts: number;
};

type AppState = {
  settings: SettingsState;
  stats: StatsState;
  progress: LessonProgress;
  srs: Record<string, SrsItem>;
  updateSettings: (patch: Partial<SettingsState>) => void;
  startSession: () => void;
  useHeart: () => void;
  addXp: (amount: number) => void;
  resetHearts: () => void;
  markLessonDone: (lessonId: string, words: string[]) => void;
  addMistake: (itemId: string) => void;
  seedSrsItems: (itemIds: string[]) => void;
  reviewSrsItem: (itemId: string, payload: { correct: boolean; speed: ResponseSpeed }) => void;
  clearMistake: (itemId: string) => void;
};

function dateKey() {
  return new Date().toISOString().slice(0, 10);
}

function previousDate(date: string) {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: {
        transliteration: true,
        sound: true,
        reducedMotion: false,
        dailyGoal: 30
      },
      stats: {
        xp: 0,
        streak: 0,
        lastActiveDate: null,
        hearts: 5
      },
      progress: {
        completedLessons: [],
        wordsLearned: [],
        mistakes: []
      },
      srs: {},
      updateSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),
      startSession: () => {
        const today = dateKey();
        const { lastActiveDate, streak } = get().stats;
        if (lastActiveDate === today) return;
        const newStreak = lastActiveDate === previousDate(today) ? streak + 1 : 1;

        set((state) => ({
          stats: {
            ...state.stats,
            lastActiveDate: today,
            streak: newStreak
          }
        }));
      },
      useHeart: () =>
        set((state) => ({
          stats: { ...state.stats, hearts: Math.max(0, state.stats.hearts - 1) }
        })),
      addXp: (amount) => set((state) => ({ stats: { ...state.stats, xp: state.stats.xp + amount } })),
      resetHearts: () => set((state) => ({ stats: { ...state.stats, hearts: 5 } })),
      markLessonDone: (lessonId, words) =>
        set((state) => ({
          progress: {
            ...state.progress,
            completedLessons: Array.from(new Set([...state.progress.completedLessons, lessonId])),
            wordsLearned: Array.from(new Set([...state.progress.wordsLearned, ...words]))
          }
        })),
      addMistake: (itemId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            mistakes: [itemId, ...state.progress.mistakes.filter((id) => id !== itemId)].slice(0, 50)
          }
        })),
      seedSrsItems: (itemIds) =>
        set((state) => {
          const next = { ...state.srs };
          itemIds.forEach((itemId) => {
            if (!next[itemId]) next[itemId] = createSrsItem(itemId);
          });
          return { srs: next };
        }),
      reviewSrsItem: (itemId, payload) =>
        set((state) => {
          const existing = state.srs[itemId] ?? createSrsItem(itemId);
          const updated = updateSrsItem(existing, payload);
          return {
            srs: { ...state.srs, [itemId]: updated }
          };
        }),
      clearMistake: (itemId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            mistakes: state.progress.mistakes.filter((id) => id !== itemId)
          }
        }))
    }),
    {
      name: "armenian-lingo-progress",
      storage: createJSONStorage(() => localStorage)
    }
  )
);

export function getDueNowCount(srs: Record<string, SrsItem>) {
  return Object.values(srs).filter((item) => isDueNow(item)).length;
}

export function getWeakItems(srs: Record<string, SrsItem>) {
  return Object.values(srs)
    .filter((item) => item.totalReviews > 0)
    .sort((a, b) => a.accuracy - b.accuracy || b.lapses - a.lapses)
    .slice(0, 10);
}
