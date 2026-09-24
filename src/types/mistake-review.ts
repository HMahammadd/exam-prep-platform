import type { SatChoiceLabel, SatQuestion } from "@/types/sat-exam";

/** Single funnel — never regresses automatically; "mastered" only via an explicit action. */
export type MistakeStatus = "to_review" | "reviewed" | "corrected" | "mastered";

export type MistakeReason =
  | "concept_gap"
  | "misread"
  | "time_pressure"
  | "rushed"
  | "other";

export type MistakeSubject = "math" | "verbal";

export const MISTAKE_REASON_LABELS: Record<MistakeReason, string> = {
  concept_gap: "Concept gap",
  misread: "Misread",
  time_pressure: "Time pressure",
  rushed: "Rushed",
  other: "Other",
};

export const MISTAKE_SUBJECT_LABELS: Record<MistakeSubject, string> = {
  math: "Math",
  verbal: "Reading & Writing",
};

/** Raw shape of a `user_mistake_reviews` row. */
export type MistakeReviewRow = {
  attempt_id: string;
  question_id: string;
  status: MistakeStatus;
  reason: MistakeReason | null;
  note: string | null;
  retry_selected_answer: string | null;
  retry_is_correct: boolean | null;
};

/** The shaped object the Mistakes UI consumes — one missed question from one attempt. */
export type MistakeItem = {
  attemptId: string;
  examId: number;
  examName: string;
  completedAt: string;
  /** 1-based position within the exam's full question order (module 1 then module 2). */
  displayNumber: number;
  question: SatQuestion;
  selectedAnswer: SatChoiceLabel | null;
  correctAnswer: SatChoiceLabel;
  subject: MistakeSubject;
  status: MistakeStatus;
  reason: MistakeReason | null;
  note: string | null;
  retrySelectedAnswer: SatChoiceLabel | null;
  retryIsCorrect: boolean | null;
};

export function mistakeKey(attemptId: string, questionId: string): string {
  return `${attemptId}:${questionId}`;
}
