"use client";

import Link from "next/link";
import { useAppStore } from "@/features/lesson/store";

export function HomeDashboard() {
  const { stats, settings, progress } = useAppStore();

  return (
    <div className="placeholder" style={{ display: "grid", gap: "0.75rem" }}>
      <p>Daily goal: <strong>{settings.dailyGoal} XP</strong></p>
      <p>Streak: <strong>{stats.streak}</strong> days</p>
      <p>Total XP: <strong>{stats.xp}</strong></p>
      <p>Completed lessons: <strong>{progress.completedLessons.length}</strong></p>
      <Link href="/lesson/unit-1-lesson-1" className="primary-btn" style={{ display: "inline-block", width: "fit-content" }}>
        Continue
      </Link>
    </div>
  );
}
