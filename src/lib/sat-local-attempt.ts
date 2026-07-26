import type { SatChoiceLabel } from "@/types/sat-exam";

export type LocalSatAnswer = {
  id: string;
  question_id: string;
  selected_answer: string | null;
  correct_answer: string;
  is_correct: boolean;
  marked_for_review: boolean;
};

export type LocalSatAttempt = {
  id: string;
  exam_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  time_spent_seconds: number;
  completed_at: string;
  answers: LocalSatAnswer[];
};

const STORAGE_PREFIX = "sat-local-attempt:";

export function localAttemptStorageKey(attemptId: string) {
  return `${STORAGE_PREFIX}${attemptId}`;
}

export function saveLocalSatAttempt(attempt: LocalSatAttempt) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(
    localAttemptStorageKey(attempt.id),
    JSON.stringify(attempt)
  );
  // Also store as latest for this exam
  localStorage.setItem(
    `sat-local-latest:${attempt.exam_id}`,
    attempt.id
  );
}

export function loadLocalSatAttempt(
  attemptId: string
): LocalSatAttempt | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = localStorage.getItem(localAttemptStorageKey(attemptId));
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as LocalSatAttempt;
  } catch {
    return null;
  }
}

export function isLocalAttemptId(attemptId: string) {
  return attemptId.startsWith("local-");
}

export type GradedAnswerRow = {
  questionId: string;
  selectedAnswer: SatChoiceLabel | null;
  correctAnswer: string;
  isCorrect: boolean;
  markedForReview: boolean;
};
