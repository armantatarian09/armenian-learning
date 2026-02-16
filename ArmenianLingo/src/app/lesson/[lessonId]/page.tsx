import { notFound } from "next/navigation";
import { getLessonById } from "@/content/curriculum";
import { LessonPlayer } from "@/features/lesson/components/lesson-player";

type Props = { params: { lessonId: string } };

export default function LessonPage({ params }: Props) {
  const lesson = getLessonById(params.lessonId);
  if (!lesson) return notFound();

  return <LessonPlayer lesson={lesson} />;
}
