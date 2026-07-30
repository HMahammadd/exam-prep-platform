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
  localStorage.setItem(`sat-local-latest:${attempt.exam_id}`, attempt.id);
  updateLocalExamSummary(attempt);
}

const SUMMARIES_KEY = "sat-local-summaries";

export type LocalExamSummary = {
  lastScore: number;
  lastTotal: number;
  bestScore: number;
  bestTotal: number;
  lastCompletedAt: string;
  lastAttemptId: string;
};

export function loadLocalExamSummaries(): Record<string, LocalExamSummary> {
  if (typeof window === "undefined") {
    return {};
  }
  const raw = localStorage.getItem(SUMMARIES_KEY);
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as Record<string, LocalExamSummary>;
  } catch {
    return {};
  }
}

export function updateLocalExamSummary(attempt: LocalSatAttempt) {
  if (typeof window === "undefined") {
    return;
  }

  const all = loadLocalExamSummaries();
  const existing = all[attempt.exam_id];
  const isNewBest =
    !existing ||
    attempt.score > existing.bestScore ||
    (attempt.score === existing.bestScore &&
      attempt.total_questions >= existing.bestTotal);

  all[attempt.exam_id] = {
    lastScore: attempt.score,
    lastTotal: attempt.total_questions,
    bestScore: isNewBest ? attempt.score : existing.bestScore,
    bestTotal: isNewBest ? attempt.total_questions : existing.bestTotal,
    lastCompletedAt: attempt.completed_at,
    lastAttemptId: attempt.id,
  };

  localStorage.setItem(SUMMARIES_KEY, JSON.stringify(all));
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
