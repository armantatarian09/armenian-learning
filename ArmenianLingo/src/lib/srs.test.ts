import { describe, expect, it } from "vitest";
import { createSrsItem, isDueNow, updateSrsItem } from "./srs";

describe("SRS scheduling", () => {
  it("creates due-now items", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const item = createSrsItem("x", now);
    expect(isDueNow(item, now)).toBe(true);
  });

  it("increases interval on correct responses", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const seed = createSrsItem("x", now);

    const review1 = updateSrsItem(seed, { correct: true, speed: "fast", now });
    expect(review1.repetitions).toBe(1);
    expect(review1.interval).toBe(1);

    const review2 = updateSrsItem(review1, {
      correct: true,
      speed: "normal",
      now: new Date("2026-01-02T00:00:00.000Z")
    });
    expect(review2.repetitions).toBe(2);
    expect(review2.interval).toBe(3);
    expect(review2.easiness).toBeGreaterThan(2.4);
  });

  it("resets repetitions on incorrect responses", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const seed = createSrsItem("x", now);
    const review1 = updateSrsItem(seed, { correct: true, speed: "normal", now });
    const review2 = updateSrsItem(review1, {
      correct: false,
      speed: "slow",
      now: new Date("2026-01-02T00:00:00.000Z")
    });

    expect(review2.repetitions).toBe(0);
    expect(review2.interval).toBe(1);
    expect(review2.lapses).toBe(1);
  });
});
