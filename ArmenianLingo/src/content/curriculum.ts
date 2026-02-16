import lesson1 from "./unit1/lesson1.json";
import { lessonSchema, type LessonData } from "@/lib/schema";

export type LessonMeta = {
  id: string;
  title: string;
  available: boolean;
};

export type UnitMeta = {
  id: string;
  title: string;
  lessons: LessonMeta[];
};

export const units: UnitMeta[] = [
  {
    id: "unit-1",
    title: "Alphabet & Greetings",
    lessons: [
      { id: "unit-1-lesson-1", title: "Alphabet & Greetings", available: true },
      { id: "unit-1-lesson-2", title: "More Letters", available: false },
      { id: "unit-1-lesson-3", title: "Basic Phrases", available: false },
      { id: "unit-1-lesson-4", title: "Formal vs Casual", available: false },
      { id: "unit-1-lesson-5", title: "Unit 1 Checkpoint", available: false }
    ]
  },
  {
    id: "unit-2",
    title: "Numbers, Dates & Basics",
    lessons: [
      { id: "unit-2-lesson-1", title: "Numbers 1–5", available: false },
      { id: "unit-2-lesson-2", title: "Numbers 6–10", available: false },
      { id: "unit-2-lesson-3", title: "Numbers 11–20", available: false },
      { id: "unit-2-lesson-4", title: "Dates Basics", available: false },
      { id: "unit-2-lesson-5", title: "Unit 2 Checkpoint", available: false }
    ]
  },
  {
    id: "unit-3",
    title: "Simple Sentences",
    lessons: [
      { id: "unit-3-lesson-1", title: "Pronouns", available: false },
      { id: "unit-3-lesson-2", title: "Present Tense", available: false },
      { id: "unit-3-lesson-3", title: "Everyday Nouns", available: false },
      { id: "unit-3-lesson-4", title: "Daily Phrases", available: false },
      { id: "unit-3-lesson-5", title: "Unit 3 Checkpoint", available: false }
    ]
  }
];

const lessonsMap: Record<string, LessonData> = {
  [lesson1.id]: lessonSchema.parse(lesson1)
};

export function getLessonById(id: string) {
  return lessonsMap[id] ?? null;
}
