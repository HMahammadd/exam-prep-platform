import {
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { DashboardHeader } from "@/components/DashboardHeader";
import { LocalSatResults } from "@/components/sat/LocalSatResults";
import { SatExamAnswerReview } from "@/components/sat/SatExamAnswerReview";
import { getSatExamById } from "@/lib/sat-exams";
import { getSatExamAttempt } from "../../../actions";

type ResultsPageProps = {
  params: Promise<{ examId: string }>;
  searchParams: Promise<{ attemptId?: string }>;
};

export default async function SatExamResultsPage({
  params,
  searchParams,
}: ResultsPageProps) {
  const { examId: examIdParam } = await params;
  const { attemptId } = await searchParams;
  const examId = Number(examIdParam);

  if (!Number.isInteger(examId) || !attemptId) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const exam = getSatExamById(examId);

  if (!exam) {
    notFound();
  }

  if (attemptId.startsWith("local-")) {
    return (
      <div className="flex flex-1 flex-col bg-background">
        <DashboardHeader
          title="Exam Results"
          backHref="/dashboard/sat"
          backLabel="SAT Practice"
        />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
          <LocalSatResults
            examId={examId}
            examName={exam.name}
            attemptId={attemptId}
          />
        </main>
      </div>
    );
  }

  const result = await getSatExamAttempt(attemptId);

  if (!result || result.attempt.exam_id !== String(examId)) {
    notFound();
  }

  const { attempt, answers } = result;

  return (
    <div className="flex flex-1 flex-col bg-background">
      <DashboardHeader
        title="Exam Results"
        backHref="/dashboard/sat"
        backLabel="SAT Practice"
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <SatExamAnswerReview
          answers={answers}
          examId={examId}
          examName={exam.name}
          score={attempt.score}
          totalQuestions={attempt.total_questions}
        />

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/dashboard/sat/exam/${examId}`}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Retake Exam
          </Link>
          <Link
            href="/dashboard/sat"
            className="inline-flex items-center gap-2 rounded-lg border border-card-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent-soft"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to SAT Practice
          </Link>
        </div>
      </main>
    </div>
  );
}
