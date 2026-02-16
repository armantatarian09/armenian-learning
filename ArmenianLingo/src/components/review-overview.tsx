"use client";

import { getDueNowCount, getWeakItems, useAppStore } from "@/features/lesson/store";
import type { ResponseSpeed } from "@/lib/srs";

function speedForMode(mode: "quick" | "careful"): ResponseSpeed {
  return mode === "quick" ? "fast" : "normal";
}

export function ReviewOverview() {
  const { srs, progress, reviewSrsItem, clearMistake, addXp } = useAppStore();

  const dueItems = Object.values(srs).filter((item) => new Date(item.dueAt).getTime() <= Date.now());
  const weakItems = getWeakItems(srs);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <section className="placeholder">
        <h2>Due now ({getDueNowCount(srs)})</h2>
        {dueItems.length === 0 ? (
          <p>Nothing due right now. Great consistency!</p>
        ) : (
          <ul>
            {dueItems.slice(0, 10).map((item) => (
              <li key={item.itemId} style={{ marginBottom: 8 }}>
                <strong>{item.itemId}</strong>{" "}
                <button
                  className="choice"
                  type="button"
                  onClick={() => {
                    reviewSrsItem(item.itemId, { correct: true, speed: speedForMode("quick") });
                    addXp(5);
                  }}
                >
                  Mark reviewed
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="placeholder">
        <h2>Weak items</h2>
        {weakItems.length === 0 ? (
          <p>Keep learning to build weak-item insights.</p>
        ) : (
          <ul>
            {weakItems.map((item) => (
              <li key={item.itemId}>
                {item.itemId} — accuracy {(item.accuracy * 100).toFixed(0)}% · lapses {item.lapses}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="placeholder">
        <h2>Mistakes mode ({progress.mistakes.length})</h2>
        {progress.mistakes.length === 0 ? (
          <p>No mistakes queued.</p>
        ) : (
          <ul>
            {progress.mistakes.slice(0, 10).map((mistakeId) => (
              <li key={mistakeId} style={{ marginBottom: 8 }}>
                {mistakeId}{" "}
                <button
                  className="choice"
                  type="button"
                  onClick={() => {
                    reviewSrsItem(mistakeId, { correct: true, speed: speedForMode("careful") });
                    clearMistake(mistakeId);
                    addXp(3);
                  }}
                >
                  Fix
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
