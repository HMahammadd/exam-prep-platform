"use client";

import { ArrowRight } from "lucide-react";
import { LocaleLink } from "@/components/LocaleLink";
import { SatExamNote } from "@/components/sat/mission/SatExamNote";
import type { SatExamProgress } from "@/lib/sat-exam-progress";
import type {
  SatExamAttemptSummary,
  SatPracticeExam,
} from "@/types/sat-exam";

export type MissionState =
  | "completed"
  | "in-progress"
  | "not-started"
  | "coming-soon";

const STATE_LABEL: Record<MissionState, string> = {
  completed: "Completed",
  "in-progress": "In progress",
  "not-started": "Not started",
  "coming-soon": "Coming soon",
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Fixed formatter — Intl would differ between server and client render. */
function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * One exam as a checkpoint on the journey. The decorative mark is the only
 * space element inside a card, it differs per state, and it never rises above
 * 6% opacity — the exam is the content, the orbit is the setting.
 */
function MissionMark({ state }: { state: MissionState }) {
  if (state === "completed") {
    return (
      <svg className="sat-mission-mark" viewBox="0 0 220 140" aria-hidden>
        <ellipse cx="150" cy="70" rx="104" ry="40" transform="rotate(-16 150 70)" />
        <ellipse cx="150" cy="70" rx="68" ry="68" />
        <circle cx="150" cy="70" r="12" className="is-solid" />
      </svg>
    );
  }

  if (state === "in-progress") {
    return (
      <svg className="sat-mission-mark" viewBox="0 0 220 140" aria-hidden>
        <path d="M40 96 L96 40 L156 78 L196 34" />
        <circle cx="40" cy="96" r="4" className="is-solid" />
        <circle cx="96" cy="40" r="3" className="is-solid" />
        <circle cx="156" cy="78" r="3.5" className="is-solid" />
        <circle cx="196" cy="34" r="3" className="is-solid" />
      </svg>
    );
  }

  return (
    <svg className="sat-mission-mark" viewBox="0 0 220 140" aria-hidden>
      <circle cx="140" cy="70" r="58" />
      <path d="M86 48 H194" />
      <path d="M82 70 H198" />
      <path d="M86 92 H194" />
    </svg>
  );
}

type SatMissionCardProps = {
  exam: SatPracticeExam;
  index: number;
  state: MissionState;
  summary?: SatExamAttemptSummary;
  progress: SatExamProgress | null;
  note: string;
  onSaveNote: (examId: number, note: string) => void;
};

export function SatMissionCard({
  exam,
  index,
  state,
  summary,
  progress,
  note,
  onSaveNote,
}: SatMissionCardProps) {
  const number = String(index + 1).padStart(2, "0");
  const title = `SAT Practice Test ${number}`;
  const lastAttempt = formatDate(summary?.lastCompletedAt);
  const isComingSoon = state === "coming-soon";

  const reviewHref = summary?.lastAttemptId
    ? summary.lastAttemptId.startsWith("local-")
      ? `/dashboard/sat/exam/${exam.id}/results?attemptId=${summary.lastAttemptId}`
      : `/dashboard/sat/exam/${exam.id}/details`
    : null;

  return (
    <article className="sat-mission-card" data-state={state}>
      <MissionMark state={state} />

      <div className="sat-mission-card-inner">
        <header className="sat-mission-card-head">
          <div className="sat-mission-card-id">
            <span className="sat-mission-number">{number}</span>
            <span className="sat-mission-state">{STATE_LABEL[state]}</span>
          </div>

          <div className="sat-mission-card-title">
            <h3>{title}</h3>
            <p className="sat-mission-meta">
              Digital SAT
              <span aria-hidden>·</span>
              {exam.questionCount} Questions
              <span aria-hidden>·</span>
              Timed
            </p>
          </div>

          {lastAttempt && state === "completed" ? (
            <p className="sat-mission-date">{lastAttempt}</p>
          ) : null}
        </header>

        {state === "completed" && summary ? (
          <dl className="sat-mission-results">
            <div>
              <dt>Score</dt>
              <dd>
                {summary.lastScore}
                <span className="sat-mission-of">/{summary.lastTotal}</span>
              </dd>
            </div>
            <div>
              <dt>Best score</dt>
              <dd>
                {summary.bestScore}
                <span className="sat-mission-of">/{summary.bestTotal}</span>
              </dd>
            </div>
            <div>
              <dt>Last attempt</dt>
              <dd className="sat-mission-result-text">{lastAttempt ?? "—"}</dd>
            </div>
          </dl>
        ) : null}

        {state === "in-progress" && progress ? (
          <div className="sat-mission-progress">
            <p className="sat-mission-progress-label">
              {progress.answered} / {progress.total} questions
            </p>
            <span
              className="sat-mission-progress-rule"
              role="img"
              aria-label={`${progress.answered} of ${progress.total} questions answered`}
            >
              <b
                style={{
                  width: `${Math.round(
                    (progress.answered / progress.total) * 100
                  )}%`,
                }}
              />
            </span>
          </div>
        ) : null}

        {state === "not-started" ? (
          <p className="sat-mission-sections">
            Reading &amp; Writing
            <span aria-hidden>·</span>
            Math
            <span aria-hidden>·</span>
            Approx. {exam.timeLimitMinutes * exam.moduleCount} min
          </p>
        ) : null}

        {!isComingSoon ? (
          <SatExamNote
            examId={exam.id}
            examName={title}
            note={note}
            onSave={onSaveNote}
          />
        ) : null}

        <footer className="sat-mission-card-foot">
          {reviewHref ? (
            <LocaleLink href={reviewHref} className="sat-mission-secondary">
              Review answers
            </LocaleLink>
          ) : (
            <span />
          )}

          {isComingSoon ? (
            <span className="sat-mission-primary is-disabled" aria-disabled>
              Coming soon
            </span>
          ) : (
            <LocaleLink
              href={`/dashboard/sat/exam/${exam.id}`}
              className="sat-mission-primary"
            >
              {state === "completed"
                ? "Retake"
                : state === "in-progress"
                  ? "Continue exam"
                  : "Start exam"}
              <ArrowRight className="sat-mission-arrow h-4 w-4" aria-hidden />
            </LocaleLink>
          )}
        </footer>
      </div>
    </article>
  );
}
