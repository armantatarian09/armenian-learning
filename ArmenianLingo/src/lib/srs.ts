export type SrsItem = {
  itemId: string;
  easiness: number;
  interval: number;
  repetitions: number;
  dueAt: string;
  lastReviewedAt?: string;
  lapses: number;
  accuracy: number;
  totalReviews: number;
};

export type ResponseSpeed = "fast" | "normal" | "slow";

export const DEFAULT_SRS_ITEM = {
  easiness: 2.5,
  interval: 0,
  repetitions: 0,
  lapses: 0,
  accuracy: 0,
  totalReviews: 0
} as const;

export function createSrsItem(itemId: string, now = new Date()): SrsItem {
  return {
    itemId,
    ...DEFAULT_SRS_ITEM,
    dueAt: now.toISOString()
  };
}

function toQuality(correct: boolean, speed: ResponseSpeed): number {
  if (!correct) return 2;
  if (speed === "fast") return 5;
  if (speed === "normal") return 4;
  return 3;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function updateSrsItem(
  item: SrsItem,
  payload: { correct: boolean; speed: ResponseSpeed; now?: Date }
): SrsItem {
  const now = payload.now ?? new Date();
  const quality = toQuality(payload.correct, payload.speed);

  let repetitions = item.repetitions;
  let interval = item.interval;
  let easiness = item.easiness;
  let lapses = item.lapses;

  if (quality >= 3) {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 3;
    else interval = Math.max(1, Math.round(interval * easiness));
  } else {
    repetitions = 0;
    interval = 1;
    lapses += 1;
  }

  easiness = clamp(
    easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
    1.3,
    2.8
  );

  const totalReviews = item.totalReviews + 1;
  const correctCount = Math.round(item.accuracy * item.totalReviews) + (payload.correct ? 1 : 0);
  const accuracy = correctCount / totalReviews;

  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + interval);

  return {
    ...item,
    repetitions,
    interval,
    easiness,
    dueAt: dueDate.toISOString(),
    lastReviewedAt: now.toISOString(),
    lapses,
    totalReviews,
    accuracy
  };
}

export function isDueNow(item: SrsItem, now = new Date()) {
  return new Date(item.dueAt).getTime() <= now.getTime();
}
