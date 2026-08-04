import { ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SatExamAnswerReview } from "@/components/sat/SatExamAnswerReview";
import { getSatExamById } from "@/lib/sat-exams";
import { getLatestSatExamAttempt } from "../../../actions";

type DetailsPageProps = {
  params: Promise<{ examId: string }>;
};

export default async function SatExamDetailsPage({ params }: DetailsPageProps) {
  const { examId: examIdParam } = await params;
  const examId = Number(examIdParam);

  if (!Number.isInteger(examId)) {
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
  const result = await getLatestSatExamAttempt(examId);

  if (!exam) {
    notFound();
  }

  if (!result) {
    return (
      <div className="flex flex-1 flex-col bg-background">
        <DashboardHeader
          title="Exam Details"
          backHref="/dashboard/sat"
          backLabel="SAT Practice"
        />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
          <div className="rounded-2xl border border-card-border bg-card p-8 text-center shadow-card">
            <p className="text-lg font-medium text-foreground">
              SAT EXAM {examId}
            </p>
            <p className="mt-2 text-muted">
              You haven&apos;t taken this exam yet. Complete it first to review
              your answers and explanations.
            </p>
            <Link
              href={`/dashboard/sat/exam/${examId}`}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
            >
              Start Exam
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { attempt, answers } = result;

  return (
    <div className="flex flex-1 flex-col bg-background">
      <DashboardHeader
        title="Exam Details"
        backHref="/dashboard/sat"
        backLabel="SAT Practice"
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-4 flex justify-end">
          <Link
            href={`/dashboard/sat/exam/${examId}`}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Retake
          </Link>
        </div>

        <SatExamAnswerReview
          answers={answers}
          examId={examId}
          examName={exam.name}
          score={attempt.score}
          totalQuestions={attempt.total_questions}
        />

        <div className="mt-8">
          <Link
            href="/dashboard/sat"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to SAT Practice
          </Link>
        </div>
      </main>
    </div>
  );
}
