import { z } from "zod";

export const exerciseTypeSchema = z.enum([
  "multiple-choice",
  "word-tiles",
  "dictation",
  "matching",
  "alphabet"
]);

export const lessonExerciseSchema = z.object({
  id: z.string(),
  type: exerciseTypeSchema,
  prompt: z.string(),
  acceptedAnswers: z.array(z.string()).min(1),
  hints: z.array(z.string()).default([]),
  transliteration: z.string().optional(),
  audioRef: z.string().optional(),
  tags: z.array(z.string()).default([]),
  skill: z.string(),
  difficulty: z.number().min(1).max(5),
  options: z.array(z.string()).optional(),
  tiles: z.array(z.string()).optional(),
  pairs: z.array(z.object({ left: z.string(), right: z.string() })).optional(),
  letter: z.string().optional(),
  sound: z.string().optional()
});

export const lessonSchema = z.object({
  id: z.string(),
  unitId: z.string(),
  title: z.string(),
  tip: z.string(),
  exercises: z.array(lessonExerciseSchema).min(1)
});

export type ExerciseType = z.infer<typeof exerciseTypeSchema>;
export type LessonExercise = z.infer<typeof lessonExerciseSchema>;
export type LessonData = z.infer<typeof lessonSchema>;
