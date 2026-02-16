"use client";

import { useAppStore } from "@/features/lesson/store";

export function ReviewOverview() {
  const { progress } = useAppStore();

  return (
    <div className="placeholder">
      <p>Due now: 0 (SRS in Phase 2)</p>
      <p>Weak items: {progress.mistakes.length}</p>
      <p>Mistakes mode items: {progress.mistakes.slice(0, 5).join(", ") || "None yet"}</p>
    </div>
  );
}
