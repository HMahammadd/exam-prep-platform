"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Clock,
  Loader2,
  Percent,
  RotateCcw,
} from "lucide-react";
import { SatExamAnswerReview } from "@/components/sat/SatExamAnswerReview";
import {
  isLocalAttemptId,
  loadLocalSatAttempt,
  type LocalSatAttempt,
} from "@/lib/sat-local-attempt";
import { formatDuration } from "@/lib/sat-utils";

type LocalSatResultsProps = {
  examId: number;
  examName: string;
  attemptId: string;
};

export function LocalSatResults({
  examId,
  examName,
  attemptId,
}: LocalSatResultsProps) {
  const [attempt, setAttempt] = useState<LocalSatAttempt | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLocalAttemptId(attemptId)) {
      setReady(true);
      return;
    }
    setAttempt(loadLocalSatAttempt(attemptId));
    setReady(true);
  }, [attemptId]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        <span className="ml-2">Loading results…</span>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="rounded-2xl border border-card-border bg-card p-8 text-center shadow-card">
        <p className="text-foreground">Results not found on this device.</p>
        <Link
          href={`/dashboard/sat/exam/${examId}`}
          className="mt-4 inline-flex text-sm font-medium text-accent hover:underline"
        >
          Retake exam
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-card-border bg-card p-8 shadow-card">
      <h2 className="text-2xl font-semibold text-foreground">
        {examName} — Results
      </h2>
      <p className="mt-1 text-sm text-muted">
        Saved on this device (Supabase tables not set up yet).
      </p>

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
        <SatExamAnswerReview answers={attempt.answers} />
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
  );
}
