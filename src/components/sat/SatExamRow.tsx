import { ArrowRight, Clock, FileText, RotateCcw } from "lucide-react";
import Link from "next/link";
import type { SatExamAttemptSummary, SatPracticeExam } from "@/types/sat-exam";

type SatExamRowProps = {
  exam: SatPracticeExam;
  summary?: SatExamAttemptSummary;
};

function formatScore(score: number | null | undefined, total: number | null | undefined) {
  if (score === null || score === undefined || total === null || total === undefined) {
    return "—";
  }
  return `${score}/${total}`;
}

export function SatExamRow({ exam, summary }: SatExamRowProps) {
  const isAvailable = exam.status === "available";
  const hasAttempt =
    summary?.lastScore !== null && summary?.lastScore !== undefined;
  const lastScoreText = formatScore(summary?.lastScore, summary?.lastTotal);
  const bestScoreText = formatScore(summary?.bestScore, summary?.bestTotal);

  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border border-card-border bg-card px-5 py-4 shadow-card sm:flex-row sm:items-center sm:justify-between ${
        !isAvailable ? "opacity-60" : ""
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <h3 className="text-base font-bold tracking-wide text-foreground sm:text-lg">
          SAT EXAM {exam.id}
        </h3>
        {!isAvailable && (
          <span className="inline-flex items-center gap-1 rounded-full bg-card-border px-2.5 py-0.5 text-xs font-medium text-muted">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            Coming Soon
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {isAvailable && (
          <>
            <p className="text-sm text-muted">
              Last Score:{" "}
              <span className="font-semibold text-foreground">
                {lastScoreText}
              </span>
            </p>
            <p className="text-sm text-muted">
              Best Score:{" "}
              <span className="font-semibold text-foreground">
                {bestScoreText}
              </span>
            </p>
          </>
        )}

        {isAvailable && hasAttempt && summary?.lastAttemptId && (
          <Link
            href={
              summary.lastAttemptId.startsWith("local-")
                ? `/dashboard/sat/exam/${exam.id}/results?attemptId=${summary.lastAttemptId}`
                : `/dashboard/sat/exam/${exam.id}/details`
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-card-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent-soft"
          >
            <FileText className="h-4 w-4 text-accent" aria-hidden />
            Details
          </Link>
        )}

        {isAvailable ? (
          <Link
            href={`/dashboard/sat/exam/${exam.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            {hasAttempt ? (
              <>
                <RotateCcw className="h-4 w-4" aria-hidden />
                Retake
              </>
            ) : (
              <>
                Start Exam
                <ArrowRight className="h-4 w-4" aria-hidden />
              </>
            )}
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-card-border px-4 py-2 text-sm font-medium text-muted">
            <Clock className="h-4 w-4" aria-hidden />
            Coming Soon
          </span>
        )}
      </div>
    </div>
  );
}
