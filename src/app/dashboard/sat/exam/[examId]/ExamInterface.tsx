"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { submitSatExam } from "../../actions";
import { SatInstructionsScreen } from "@/components/sat/bluebook/SatInstructionsScreen";
import {
  SatExamHeaderRight,
  SatQuestionScreen,
} from "@/components/sat/bluebook/SatQuestionScreen";
import { SatReviewScreen } from "@/components/sat/bluebook/SatReviewScreen";
import { saveLocalSatAttempt } from "@/lib/sat-local-attempt";
import { formatSeconds } from "@/lib/sat-utils";
import type {
  SatChoiceLabel,
  SatClientQuestion,
  SatPracticeExam,
} from "@/types/sat-exam";

type ExamInterfaceProps = {
  exam: SatPracticeExam;
  questions: SatClientQuestion[];
  studentName: string;
};

type Phase = "instructions" | "questions" | "review";

type StoredExamState = {
  phase: Phase;
  currentIndex: number;
  answers: Record<string, SatChoiceLabel | null>;
  marked: Record<string, boolean>;
  eliminated: Record<string, SatChoiceLabel[]>;
  remainingSeconds: number;
};

function storageKey(examId: number) {
  return `sat-exam-${examId}`;
}

export function ExamInterface({
  exam,
  questions,
  studentName,
}: ExamInterfaceProps) {
  const router = useRouter();
  const totalSeconds = exam.timeLimitMinutes * 60;

  const [phase, setPhase] = useState<Phase>("instructions");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, SatChoiceLabel | null>>(
    () => Object.fromEntries(questions.map((q) => [q.id, null]))
  );
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [eliminated, setEliminated] = useState<
    Record<string, SatChoiceLabel[]>
  >(() => Object.fromEntries(questions.map((q) => [q.id, []])));
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [timerVisible, setTimerVisible] = useState(true);
  const [directionsOpen, setDirectionsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;
  const timerActive = phase === "questions" || phase === "review";

  useEffect(() => {
    const raw = sessionStorage.getItem(storageKey(exam.id));
    if (raw) {
      try {
        const stored = JSON.parse(raw) as StoredExamState;
        setPhase(stored.phase ?? "instructions");
        setCurrentIndex(stored.currentIndex);
        setAnswers(stored.answers);
        setMarked(stored.marked);
        setEliminated(
          stored.eliminated ??
            Object.fromEntries(questions.map((q) => [q.id, []]))
        );
        setRemainingSeconds(stored.remainingSeconds);
      } catch {
        sessionStorage.removeItem(storageKey(exam.id));
      }
    }
    setHydrated(true);
  }, [exam.id, questions]);

  useEffect(() => {
    if (!hydrated || submitted) {
      return;
    }

    sessionStorage.setItem(
      storageKey(exam.id),
      JSON.stringify({
        phase,
        currentIndex,
        answers,
        marked,
        eliminated,
        remainingSeconds,
      } satisfies StoredExamState)
    );
  }, [
    answers,
    currentIndex,
    eliminated,
    exam.id,
    hydrated,
    marked,
    phase,
    remainingSeconds,
    submitted,
  ]);

  const handleSubmit = useCallback(async () => {
    if (submitted || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const timeSpentSeconds = totalSeconds - remainingSeconds;
    const payload = questions.map((question) => ({
      questionId: question.id,
      selectedAnswer: answers[question.id] ?? null,
      markedForReview: marked[question.id] ?? false,
    }));

    const result = await submitSatExam({
      examId: String(exam.id),
      answers: payload,
      timeSpentSeconds,
    });

    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    if (result.local && result.localAttempt) {
      saveLocalSatAttempt(result.localAttempt);
    }

    setSubmitted(true);
    sessionStorage.removeItem(storageKey(exam.id));
    router.push(
      `/dashboard/sat/exam/${exam.id}/results?attemptId=${result.attemptId}`
    );
  }, [
    answers,
    exam.id,
    isSubmitting,
    marked,
    questions,
    remainingSeconds,
    router,
    submitted,
    totalSeconds,
  ]);

  useEffect(() => {
    if (!hydrated || submitted || isSubmitting || !timerActive) {
      return;
    }

    if (remainingSeconds <= 0) {
      void handleSubmit();
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((value) => value - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [
    handleSubmit,
    hydrated,
    isSubmitting,
    remainingSeconds,
    submitted,
    timerActive,
  ]);

  const navItems = useMemo(
    () =>
      questions.map((question, index) => ({
        index,
        answered: answers[question.id] !== null,
        marked: marked[question.id] ?? false,
        current: index === currentIndex,
      })),
    [answers, currentIndex, marked, questions]
  );

  function toggleEliminate(questionId: string, label: SatChoiceLabel) {
    setEliminated((prev) => {
      const current = new Set(prev[questionId] ?? []);
      if (current.has(label)) {
        current.delete(label);
      } else {
        current.add(label);
      }
      return { ...prev, [questionId]: [...current] };
    });
    setAnswers((prev) =>
      prev[questionId] === label ? { ...prev, [questionId]: null } : prev
    );
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa] text-[#5f6368]">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        <span className="ml-2">Loading exam…</span>
      </div>
    );
  }

  if (phase === "instructions") {
    return (
      <SatInstructionsScreen
        onBack={() => router.push("/dashboard/sat")}
        onNext={() => setPhase("questions")}
      />
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8f9fa] text-[#202124]">
      {/* Top header */}
      <header className="shrink-0 border-b border-[#e5e7eb] bg-[#f8f9fa] px-4 py-2 sm:px-6">
        <div className="mx-auto grid max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold sm:text-base">
              Section 1, Module 1: Reading and Writing
            </p>
            <button
              type="button"
              onClick={() => setDirectionsOpen((v) => !v)}
              className="mt-0.5 inline-flex items-center gap-1 text-sm text-[#202124] hover:underline"
            >
              Directions
              <span className="text-xs">{directionsOpen ? "▴" : "▾"}</span>
            </button>
          </div>

          <div className="flex flex-col items-center">
            {timerVisible ? (
              <span
                className={`font-mono text-xl font-semibold tabular-nums ${
                  remainingSeconds <= 300 ? "text-red-600" : "text-[#202124]"
                }`}
              >
                {formatSeconds(Math.max(remainingSeconds, 0))}
              </span>
            ) : (
              <span className="text-sm text-[#5f6368]">Timer hidden</span>
            )}
            <button
              type="button"
              onClick={() => setTimerVisible((v) => !v)}
              className="mt-1 rounded-full border border-[#5f6368] bg-white px-3 py-0.5 text-xs font-medium text-[#202124]"
            >
              {timerVisible ? "Hide" : "Show"}
            </button>
          </div>

          <div className="flex justify-end">
            <SatExamHeaderRight />
          </div>
        </div>
      </header>

      {/* Practice banner */}
      <div className="shrink-0 border-y border-dashed border-white bg-[#1a2b4c] px-4 py-2">
        <p className="text-center text-xs font-semibold tracking-widest text-white sm:text-sm">
          THIS IS A PRACTICE TEST
        </p>
      </div>

      {directionsOpen && phase === "questions" && (
        <div className="shrink-0 border-b border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#5f6368] sm:px-6">
          Read each passage and question carefully. Choose the best answer based
          only on the information provided. You can mark questions for review
          and eliminate answer choices.
        </div>
      )}

      {phase === "questions" && currentQuestion && (
        <SatQuestionScreen
          question={currentQuestion}
          questionIndex={currentIndex}
          totalQuestions={questions.length}
          selectedAnswer={answers[currentQuestion.id]}
          marked={marked[currentQuestion.id] ?? false}
          eliminated={eliminated[currentQuestion.id] ?? []}
          studentName={studentName}
          onSelectAnswer={(label) =>
            setAnswers((prev) => ({
              ...prev,
              [currentQuestion.id]: label,
            }))
          }
          onToggleMark={() =>
            setMarked((prev) => ({
              ...prev,
              [currentQuestion.id]: !prev[currentQuestion.id],
            }))
          }
          onToggleEliminate={(label) =>
            toggleEliminate(currentQuestion.id, label)
          }
          onBack={() => setCurrentIndex((i) => i - 1)}
          onNext={() => {
            if (isLast) {
              setPhase("review");
            } else {
              setCurrentIndex((i) => i + 1);
            }
          }}
          isFirst={isFirst}
          isLast={isLast}
          navItems={navItems}
          onGoToQuestion={setCurrentIndex}
          onGoToReview={() => setPhase("review")}
        />
      )}

      {phase === "review" && (
        <SatReviewScreen
          items={navItems}
          studentName={studentName}
          onSelectQuestion={(index) => {
            setCurrentIndex(index);
            setPhase("questions");
          }}
          onBack={() => {
            setCurrentIndex(questions.length - 1);
            setPhase("questions");
          }}
          onNext={() => setShowConfirm(true)}
        />
      )}

      {error && (
        <p className="shrink-0 bg-red-50 px-4 py-2 text-center text-sm text-red-700">
          {error}
        </p>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-[#202124]">
              Submit exam?
            </h3>
            <p className="mt-2 text-sm text-[#5f6368]">
              Are you sure you want to submit? You will not be able to change
              your answers after submitting.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-full border border-[#dadce0] px-4 py-2 text-sm font-semibold text-[#202124]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setShowConfirm(false);
                  void handleSubmit();
                }}
                className="rounded-full bg-[#3b5998] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isSubmitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isSubmitting && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30">
          <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-[#3b5998]" />
            <span className="text-sm font-medium">Submitting…</span>
          </div>
        </div>
      )}
    </div>
  );
}
