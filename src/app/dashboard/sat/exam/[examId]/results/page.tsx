import {
  ArrowLeft,
  Award,
  Clock,
  Percent,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { DashboardHeader } from "@/components/DashboardHeader";
import { LocalSatResults } from "@/components/sat/LocalSatResults";
import { SatExamAnswerReview } from "@/components/sat/SatExamAnswerReview";
import { formatDuration } from "@/lib/sat-utils";
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
        <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
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

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="rounded-2xl border border-card-border bg-card p-8 shadow-card">
          <h2 className="text-2xl font-semibold text-foreground">
            {exam.name} — Results
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-accent-soft p-4">
              <p className="inline-flex items-center gap-1.5 text-sm text-muted">
                <Award className="h-4 w-4 text-accent" aria-hidden />
                Score
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {attempt.score}/{attempt.total_questions}
              </p>
            </div>
            <div className="rounded-xl bg-accent-soft p-4">
              <p className="inline-flex items-center gap-1.5 text-sm text-muted">
                <Percent className="h-4 w-4 text-accent" aria-hidden />
                Percentage
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {attempt.percentage}%
              </p>
            </div>
            <div className="rounded-xl bg-accent-soft p-4">
              <p className="inline-flex items-center gap-1.5 text-sm text-muted">
                <Clock className="h-4 w-4 text-accent" aria-hidden />
                Time spent
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {formatDuration(attempt.time_spent_seconds)}
              </p>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Answer review
            </h3>
            <SatExamAnswerReview answers={answers} />
          </div>

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
        </div>
      </main>
    </div>
  );
}
