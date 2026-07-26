import { BookOpen } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DimMathTestSession } from "@/components/dim/DimMathTestSession";
import {
  getDimMathChapter,
  isDimMathChapterAvailable,
} from "@/lib/dim-math-chapters";
import { getDimMathQuestions } from "@/lib/dim-math/questions";
import type { DimMathClientQuestion } from "@/types/dim-math";

type ChapterPageProps = {
  params: Promise<{ chapterId: string }>;
};

export default async function DimMathChapterPage({ params }: ChapterPageProps) {
  const { chapterId: chapterIdParam } = await params;
  const chapterId = Number(chapterIdParam);

  if (!Number.isInteger(chapterId)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const chapter = getDimMathChapter(chapterId);

  if (!chapter) {
    notFound();
  }

  if (!isDimMathChapterAvailable(chapterId)) {
    redirect("/dashboard/dim/buraxilis/math");
  }

  const questions = getDimMathQuestions(chapterId);

  if (!questions.length) {
    return (
      <div className="flex flex-1 flex-col bg-background">
        <DashboardHeader
          title={`${chapter.id}. ${chapter.title}`}
          backHref="/dashboard/dim/buraxilis/math"
          backLabel="Math"
        />
        <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
          <div className="rounded-2xl border border-card-border bg-card p-8 text-center shadow-card">
            <p className="text-muted">
              Bu fəsil üçün suallar tezliklə əlavə olunacaq.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const testName = questions[0]?.testName ?? "TEST";

  // Never send the answer key to the test-taking client — grading is done
  // server-side in `gradeDimTest`.
  const clientQuestions: DimMathClientQuestion[] = questions.map((question) => ({
    id: question.id,
    chapterId: question.chapterId,
    testName: question.testName,
    questionNumber: question.questionNumber,
    questionText: question.questionText,
    questionType: question.questionType,
    diagramId: question.diagramId,
    choices: question.choices,
  }));

  return (
    <div className="flex flex-1 flex-col bg-background">
      <DashboardHeader
        title={`${chapter.id}. ${chapter.title}`}
        backHref="/dashboard/dim/buraxilis/math"
        backLabel="Math"
      />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-8">
        <div className="mb-6 flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft">
            <BookOpen className="h-6 w-6 text-accent" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-medium text-muted">Fəsil {chapter.id}</p>
            <h2 className="text-2xl font-bold text-foreground">{chapter.title}</h2>
            <p className="mt-1 text-sm text-muted">{testName} — {questions.length} sual</p>
          </div>
        </div>

        <DimMathTestSession
          chapterId={chapterId}
          chapterTitle={chapter.title}
          testName={testName}
          questions={clientQuestions}
          backHref="/dashboard/dim/buraxilis/math"
        />
      </main>
    </div>
  );
}
