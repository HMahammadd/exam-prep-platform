import { notFound } from "next/navigation";
import { StudentNotesLesson } from "@/components/sat/lessons/StudentNotesLesson";
import { WordsInContextLesson } from "@/components/sat/lessons/WordsInContextLesson";
import { getSatLesson } from "@/lib/sat-lessons";

type SatLessonPageProps = {
  params: Promise<{ lessonSlug: string }>;
};

export default async function SatLessonPage({ params }: SatLessonPageProps) {
  const { lessonSlug } = await params;
  const lesson = getSatLesson(lessonSlug);

  if (!lesson) {
    notFound();
  }

  if (lesson.slug === "words-in-context") {
    return <WordsInContextLesson />;
  }

  if (lesson.slug === "student-notes") {
    return <StudentNotesLesson />;
  }

  return (
    <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
      {lesson.title}
    </h1>
  );
}
