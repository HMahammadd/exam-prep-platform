"use client";

import { useId } from "react";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  ChartNoAxesColumnIncreasing,
  Check,
  Clock,
  FileText,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { LocaleLink } from "@/components/LocaleLink";
import { TIMED_SESSION_PATH, formatClock } from "@/lib/timed-practice";
import type {
  TimedErrorCode,
  TimedResumeInfo,
  TimedSectionId,
  TimedSessionPlan,
} from "@/types/timed-practice";
import { useTimedCopy } from "./useTimedCopy";

const SECTION_ICONS: Record<TimedSectionId, LucideIcon> = {
  math: Calculator,
  "reading-writing": BookOpen,
};

/** Re-keyed on change so the new value fades in instead of snapping. */
function Changing({ value }: { value: string | number }) {
  return (
    <span key={value} className="tp-fade">
      {value}
    </span>
  );
}

export function SessionSummary({
  plan,
  customized,
  pacing,
  onPacing,
}: {
  plan: TimedSessionPlan;
  customized: boolean;
  pacing: boolean;
  onPacing: (pacing: boolean) => void;
}) {
  const { tp, plural } = useTimedCopy();
  const baseId = useId();

  return (
    <section className="tp-summary" aria-labelledby={`${baseId}-label`}>
      <h3 id={`${baseId}-label`} className="tp-label">
        {tp("yourSession")}
      </h3>

      <ul className="tp-facts">
        <li>
          <Clock className="tp-fact-icon" strokeWidth={1.5} aria-hidden />
          <Changing value={plural("minutes", plan.minutes)} />
        </li>
        <li>
          <FileText className="tp-fact-icon" strokeWidth={1.5} aria-hidden />
          <Changing value={plural("questions", plan.questionCount)} />
        </li>
        <li>
          <ChartNoAxesColumnIncreasing className="tp-fact-icon" strokeWidth={1.5} aria-hidden />
          {tp("mixedDifficulty")}
        </li>
      </ul>

      <div className="tp-split">
        <p className="tp-split-title">{tp("contentSplit")}</p>
        <ul className="tp-split-list">
          {plan.split.map((row) => {
            const Icon = SECTION_ICONS[row.section];
            return (
              <li key={row.section} className="tp-split-row">
                <Icon className="tp-split-icon" strokeWidth={1.5} aria-hidden />
                <span className="tp-split-body">
                  <span className="tp-split-name">
                    {tp(`sections.${row.section}`)}
                    {customized && row.topicsOn < row.topicsAll ? (
                      <span className="tp-split-topics">
                        {tp("topicsOf", { on: row.topicsOn, all: row.topicsAll })}
                      </span>
                    ) : null}
                  </span>
                  <span className="tp-split-count">
                    <Changing value={row.count} />
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
        {plan.limited ? <p className="tp-split-note">{tp("limited")}</p> : null}
      </div>

      <label className="tp-pacing">
        <input
          type="checkbox"
          className="tp-check-input"
          checked={pacing}
          onChange={(event) => onPacing(event.target.checked)}
          aria-describedby={`${baseId}-pacing`}
        />
        <span className="tp-check-box" aria-hidden>
          <Check strokeWidth={2.5} />
        </span>
        <span className="tp-pacing-text">
          <span className="tp-pacing-title">{tp("pacing")}</span>
          <span id={`${baseId}-pacing`} className="tp-pacing-hint">
            {tp("pacingHint")}
          </span>
        </span>
      </label>

      {/* One quiet announcement instead of every number speaking up on its own. */}
      <p className="sr-only" aria-live="polite">
        {`${plural("minutes", plan.minutes)}, ${plural("questions", plan.questionCount)}`}
      </p>
    </section>
  );
}

export function SessionActions({
  pending,
  error,
  resume,
  onStart,
}: {
  pending: boolean;
  error: TimedErrorCode | null;
  resume: TimedResumeInfo | null;
  onStart: () => void;
}) {
  const { tp } = useTimedCopy();
  const errorId = useId();

  return (
    <>
      {/* Sticks to the bottom of the screen on phones (see .tp-action). */}
      <div className="tp-action">
        <button
          type="button"
          className="tp-start"
          onClick={onStart}
          disabled={pending}
          aria-busy={pending}
          aria-describedby={error ? errorId : undefined}
        >
          {pending ? <Loader2 className="tp-start-spinner" aria-hidden /> : null}
          {pending ? tp("starting") : tp("start")}
          {pending ? null : <ArrowRight className="tp-start-arrow" aria-hidden />}
        </button>

        {error ? (
          <p id={errorId} className="tp-error" role="alert">
            {tp(`errors.${error}`)}
          </p>
        ) : null}
      </div>

      <div className="tp-after">
        {/* Only offered when there really is an unfinished session to go back to. */}
        {resume ? (
          <LocaleLink href={TIMED_SESSION_PATH} className="tp-resume">
            {tp("resume")} <span aria-hidden>·</span>
            <span className="sr-only">,</span>{" "}
            {resume.remainingSeconds > 0
              ? tp("resumeLeft", { time: formatClock(resume.remainingSeconds) })
              : tp("resumeOver")}
          </LocaleLink>
        ) : null}
      </div>
    </>
  );
}
