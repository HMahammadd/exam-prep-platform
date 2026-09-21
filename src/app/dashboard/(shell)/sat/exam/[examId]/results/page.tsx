import {
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { LocaleLink } from "@/components/LocaleLink";
import { notFound, redirect } from "next/navigation";
import { getCachedUser } from "@/lib/cached-auth";
import { LocalSatResults } from "@/components/sat/LocalSatResults";
import { SatExamAnswerReview } from "@/components/sat/SatExamAnswerReview";
import { getSatExamById } from "@/lib/sat-exams";
import { getExamQuestions } from "@/lib/sat-questions";
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

  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const exam = getSatExamById(examId);

  if (!exam) {
    notFound();
  }

  const questions = await getExamQuestions(examId);

  if (attemptId.startsWith("local-")) {
    return (
      <div className="mx-auto w-full max-w-7xl">
          <LocalSatResults
            examId={examId}
            examName={exam.name}
            attemptId={attemptId}
            questions={questions}
          />
        </div>
    );
  }

  const result = await getSatExamAttempt(attemptId);

  if (!result || result.attempt.exam_id !== String(examId)) {
    notFound();
  }

  const { attempt, answers } = result;

  return (
    <div className="mx-auto w-full max-w-7xl">
        <SatExamAnswerReview
          answers={answers}
          examName={exam.name}
          questions={questions}
          score={attempt.score}
          totalQuestions={attempt.total_questions}
        />

        <div className="mt-8 flex flex-wrap gap-3">
          <LocaleLink
            href={`/dashboard/sat/exam/${examId}`}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Retake Exam
          </LocaleLink>
          <LocaleLink
            href="/dashboard/sat"
            className="inline-flex items-center gap-2 rounded-lg border border-card-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent-soft"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to SAT Practice
          </LocaleLink>
        </div>
      </div>
  );
}
