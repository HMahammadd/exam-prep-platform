"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import {
  saveTimedPracticeProgress,
  submitTimedPractice,
} from "@/app/dashboard/(shell)/sat/timed-practice-actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { SatQuestionScreen } from "@/components/sat/bluebook/SatQuestionScreen";
import { SatReviewScreen } from "@/components/sat/bluebook/SatReviewScreen";
import { withLocale } from "@/lib/i18n/config";
import { TIMED_PRACTICE_PATH, TIMED_RESULTS_PATH, formatClock } from "@/lib/timed-practice";
import type { SatChoiceLabel } from "@/types/sat-exam";
import type { TimedErrorCode, TimedRunnerData } from "@/types/timed-practice";
import { useTimedCopy } from "./useTimedCopy";

type Phase = "questions" | "review";

/**
 * Progress is saved this often while the clock runs, shortly after each
 * answer, and whenever the tab is hidden. Each save rewrites the cookie, which
 * re-renders this page on the server, so the interval stays unhurried.
 */
const SAVE_EVERY_MS = 30_000;
const SAVE_AFTER_ANSWER_MS = 800;

function localIsoDate() {
  // en-CA formats as YYYY-MM-DD, in the browser's own time zone.
  return new Intl.DateTimeFormat("en-CA").format(new Date());
}

/**
 * The timed session, in the same Bluebook-style screens as the practice
 * exams. The clock runs from the saved remaining time, so leaving the page
 * pauses it; with SAT pacing on the session submits itself at 0:00, otherwise
 * the clock keeps counting as overtime.
 */
export function TimedPracticeRunner({ data }: { data: TimedRunnerData }) {
  const router = useRouter();
  const { tp, locale } = useTimedCopy();
  const { questions, sessionId, config } = data;
  const strict = config.pacing;

  const [phase, setPhase] = useState<Phase>("questions");
  const [index, setIndex] = useState(() => Math.max(0, data.answers.findIndex((answer) => answer === null)));
  const [answers, setAnswers] = useState(data.answers);
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [eliminated, setEliminated] = useState<Record<string, SatChoiceLabel[]>>({});
  const [remaining, setRemaining] = useState(data.remainingSeconds);
  const [timerVisible, setTimerVisible] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<TimedErrorCode | null>(null);
  const [submitting, startSubmit] = useTransition();
  const [exiting, startExit] = useTransition();

  // Latest values for the save queue and timers, which outlive any one render.
  const answersRef = useRef(answers);
  const remainingRef = useRef(remaining);
  const doneRef = useRef(false);
  const savingRef = useRef<Promise<void> | null>(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  /** One save in flight at a time; anything that changes meanwhile is saved right after. */
  const save = useCallback((): Promise<void> => {
    if (doneRef.current) return Promise.resolve();
    if (savingRef.current) {
      dirtyRef.current = true;
      return savingRef.current;
    }
    const run = (async () => {
      do {
        dirtyRef.current = false;
        try {
          await saveTimedPracticeProgress(sessionId, answersRef.current, remainingRef.current);
        } catch {
          // Offline for a moment — the next save carries the same state.
        }
      } while (dirtyRef.current && !doneRef.current);
      savingRef.current = null;
    })();
    savingRef.current = run;
    return run;
  }, [sessionId]);

  const submit = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setConfirming(false);
    setError(null);
    startSubmit(async () => {
      await savingRef.current;
      let failed: TimedErrorCode | null = null;
      try {
        const result = await submitTimedPractice(
          sessionId,
          answersRef.current,
          remainingRef.current,
          localIsoDate()
        );
        if (!result.success) failed = result.error;
      } catch {
        failed = "failed";
      }
      if (failed) {
        doneRef.current = false;
        setError(failed);
        return;
      }
      router.push(withLocale(TIMED_RESULTS_PATH, locale));
    });
  }, [locale, router, sessionId]);

  // The clock: measured against the wall clock, so a throttled background tab stays accurate.
  useEffect(() => {
    const startedAt = Date.now();
    const startRemaining = remainingRef.current;
    const floor = -data.limitSeconds;
    const tick = window.setInterval(() => {
      if (doneRef.current) return;
      const next = Math.max(floor, startRemaining - Math.floor((Date.now() - startedAt) / 1000));
      setRemaining(strict ? Math.max(0, next) : next);
    }, 250);
    return () => window.clearInterval(tick);
  }, [data.limitSeconds, strict]);

  // SAT pacing: time's up means the session is handed in.
  const expired = strict && remaining <= 0;
  useEffect(() => {
    if (expired) submit();
  }, [expired, submit]);

  // Periodic saves, plus one whenever the tab is hidden (switching apps, closing).
  useEffect(() => {
    const interval = window.setInterval(() => void save(), SAVE_EVERY_MS);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") void save();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [save]);

  // Save shortly after each answer change (debounced).
  const firstAnswers = useRef(true);
  useEffect(() => {
    if (firstAnswers.current) {
      firstAnswers.current = false;
      return;
    }
    const timeout = window.setTimeout(() => void save(), SAVE_AFTER_ANSWER_MS);
    return () => window.clearTimeout(timeout);
  }, [answers, save]);

  // Stable: ConfirmDialog re-runs its focus effect whenever onCancel changes,
  // and this component re-renders on every clock tick.
  const closeConfirm = useCallback(() => setConfirming(false), []);

  function exit() {
    startExit(async () => {
      await save();
      router.push(withLocale(TIMED_PRACTICE_PATH, locale));
    });
  }

  const navItems = useMemo(
    () =>
      questions.map((question, position) => ({
        index: position,
        answered: answers[position] !== null,
        marked: marked[question.id] ?? false,
        current: position === index,
      })),
    [answers, index, marked, questions]
  );

  const answeredCount = answers.filter((answer) => answer !== null).length;
  const question = questions[index];
  const isLast = index === questions.length - 1;

  function selectAnswer(label: SatChoiceLabel) {
    setAnswers((current) => current.map((answer, position) => (position === index ? label : answer)));
  }

  function toggleEliminate(label: SatChoiceLabel) {
    const id = question.id;
    setEliminated((current) => {
      const set = new Set(current[id] ?? []);
      if (set.has(label)) set.delete(label);
      else set.add(label);
      return { ...current, [id]: [...set] };
    });
    if (answers[index] === label) {
      setAnswers((current) => current.map((answer, position) => (position === index ? null : answer)));
    }
  }

  const overtime = remaining < 0;
  const clock = `${overtime ? "+" : ""}${formatClock(remaining)}`;
  const urgent = overtime || remaining <= 300;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8f9fa] text-[#202124]">
      <header className="shrink-0 border-b border-[#e5e7eb] bg-[#f8f9fa] px-4 py-2 sm:px-6">
        <div className="mx-auto grid max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center gap-2">
          <p className="min-w-0 truncate text-sm font-bold sm:text-base">
            {tp(`runner.heading.${config.focus}`)}
          </p>

          <div className="flex flex-col items-center" role="timer" aria-live="off">
            {timerVisible ? (
              <span
                className={`font-mono text-xl font-semibold tabular-nums ${urgent ? "text-red-600" : "text-[#202124]"}`}
              >
                {clock}
                {overtime ? (
                  <span className="ml-1 text-xs font-medium">{tp("runner.overtime")}</span>
                ) : null}
              </span>
            ) : (
              <span className="text-sm text-[#5f6368]">{tp("runner.timerHidden")}</span>
            )}
            <button
              type="button"
              onClick={() => setTimerVisible((value) => !value)}
              className="mt-1 rounded-full border border-[#5f6368] bg-white px-3 py-0.5 text-xs font-medium text-[#202124]"
            >
              {timerVisible ? tp("runner.hide") : tp("runner.show")}
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={exit}
              disabled={exiting || submitting}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#dadce0] bg-white px-3 py-1.5 text-xs font-semibold text-[#202124] hover:bg-[#f1f3f4] disabled:opacity-60 sm:text-sm"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              {exiting ? tp("runner.saving") : tp("runner.saveExit")}
            </button>
          </div>
        </div>
      </header>

      <div className="shrink-0 border-y border-dashed border-white bg-[#1a2b4c] px-4 py-2">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-white sm:text-sm">
          {strict ? tp("runner.banner") : tp("runner.bannerRelaxed")}
        </p>
      </div>

      {overtime && !strict ? (
        <p className="shrink-0 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900" role="status">
          {tp("runner.timeUpRelaxed")}
        </p>
      ) : null}

      {phase === "questions" && question ? (
        <SatQuestionScreen
          question={question}
          questionIndex={index}
          totalQuestions={questions.length}
          selectedAnswer={answers[index]}
          marked={marked[question.id] ?? false}
          eliminated={eliminated[question.id] ?? []}
          studentName={data.studentName}
          onSelectAnswer={selectAnswer}
          onToggleMark={() => setMarked((current) => ({ ...current, [question.id]: !current[question.id] }))}
          onToggleEliminate={toggleEliminate}
          onBack={() => setIndex((value) => Math.max(0, value - 1))}
          onNext={() => (isLast ? setPhase("review") : setIndex((value) => value + 1))}
          isFirst={index === 0}
          isLast={isLast}
          navItems={navItems}
          onGoToQuestion={setIndex}
          onGoToReview={() => setPhase("review")}
        />
      ) : null}

      {phase === "review" ? (
        <SatReviewScreen
          items={navItems}
          studentName={data.studentName}
          onSelectQuestion={(position) => {
            setIndex(position);
            setPhase("questions");
          }}
          onBack={() => {
            setIndex(questions.length - 1);
            setPhase("questions");
          }}
          onNext={() => setConfirming(true)}
        />
      ) : null}

      {error ? (
        <p className="shrink-0 bg-red-50 px-4 py-2 text-center text-sm text-red-700" role="alert">
          {tp(`errors.${error}`)}
        </p>
      ) : null}

      <ConfirmDialog
        open={confirming}
        title={tp("runner.submitTitle")}
        message={tp("runner.submitBody", { answered: answeredCount, total: questions.length })}
        confirmLabel={tp("runner.submit")}
        cancelLabel={tp("runner.keepWorking")}
        loading={submitting}
        onConfirm={submit}
        onCancel={closeConfirm}
      />

      {submitting ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30" role="status">
          <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-[#3b5998]" aria-hidden />
            <span className="text-sm font-medium">
              {expired ? tp("runner.timeUp") : tp("runner.submitting")}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
