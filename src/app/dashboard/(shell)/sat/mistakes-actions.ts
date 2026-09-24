"use server";

import { createClient } from "@/lib/supabaseServer";
import { getCachedUser } from "@/lib/cached-auth";
import { getExamQuestions, getQuestionById } from "@/lib/sat-questions";
import { sectionKeyFromQuestion } from "@/lib/sat-review";
import { advanceStatus } from "@/lib/mistake-review";
import type {
  MistakeItem,
  MistakeReason,
  MistakeReviewRow,
  MistakeStatus,
} from "@/types/mistake-review";
import type { SatChoiceLabel, SatQuestion } from "@/types/sat-exam";

type AttemptRow = { id: string; exam_id: string; completed_at: string };
type AnswerRow = {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_answer: string | null;
  correct_answer: string;
  is_correct: boolean;
};

/**
 * All of a user's wrong/missed answers across every real (Supabase-backed)
 * attempt, joined with question content and per-user review state. No
 * localStorage-fallback attempts are included — see the Mistakes plan: the
 * counts shown here must be exactly what's in the database.
 */
export async function getSatMistakes(): Promise<MistakeItem[]> {
  const user = await getCachedUser();
  if (!user) return [];

  const supabase = await createClient();

  const { data: attempts, error: attemptsError } = await supabase
    .from("sat_exam_attempts")
    .select("id, exam_id, completed_at")
    .eq("user_id", user.id);

  if (attemptsError) {
    console.error("Failed to load sat_exam_attempts:", attemptsError);
  }
  if (!attempts || attempts.length === 0) return [];

  const attemptIds = attempts.map((attempt) => attempt.id);
  const attemptById = new Map(
    (attempts as AttemptRow[]).map((attempt) => [attempt.id, attempt])
  );

  const { data: answers, error: answersError } = await supabase
    .from("sat_exam_answers")
    .select(
      "id, attempt_id, question_id, selected_answer, correct_answer, is_correct"
    )
    .in("attempt_id", attemptIds)
    .eq("is_correct", false);

  if (answersError) {
    console.error("Failed to load sat_exam_answers:", answersError);
  }
  if (!answers || answers.length === 0) return [];

  const { data: reviewRows, error: reviewError } = await supabase
    .from("user_mistake_reviews")
    .select(
      "attempt_id, question_id, status, reason, note, retry_selected_answer, retry_is_correct"
    )
    .eq("user_id", user.id);

  if (reviewError) {
    console.error("Failed to load user_mistake_reviews:", reviewError);
  }

  const reviewByKey = new Map(
    ((reviewRows as MistakeReviewRow[] | null) ?? []).map((row) => [
      `${row.attempt_id}:${row.question_id}`,
      row,
    ])
  );

  // Fetch each distinct exam's full question bank once, both to resolve
  // question content and to derive a stable combined question number
  // (module 1 then module 2, matching the exam bank's own array order) —
  // the same "Q28" style numbering shown in the exam review UI.
  const examIds = Array.from(
    new Set((attempts as AttemptRow[]).map((attempt) => Number(attempt.exam_id)))
  );
  const questionsByExam = new Map<number, SatQuestion[]>();
  for (const examId of examIds) {
    questionsByExam.set(examId, await getExamQuestions(examId));
  }

  const items: MistakeItem[] = [];

  for (const answer of answers as AnswerRow[]) {
    const attempt = attemptById.get(answer.attempt_id);
    if (!attempt) continue;

    const examId = Number(attempt.exam_id);
    const examQuestions = questionsByExam.get(examId) ?? [];
    const questionIndex = examQuestions.findIndex(
      (item) => item.id === answer.question_id
    );
    const question =
      questionIndex >= 0
        ? examQuestions[questionIndex]
        : await getQuestionById(answer.question_id);
    if (!question) continue;

    const review = reviewByKey.get(`${answer.attempt_id}:${answer.question_id}`);

    items.push({
      attemptId: attempt.id,
      examId,
      examName: `SAT Practice Test ${String(attempt.exam_id).padStart(2, "0")}`,
      completedAt: attempt.completed_at,
      displayNumber: questionIndex >= 0 ? questionIndex + 1 : 0,
      question,
      selectedAnswer: (answer.selected_answer as SatChoiceLabel | null) ?? null,
      correctAnswer: answer.correct_answer as SatChoiceLabel,
      subject: sectionKeyFromQuestion(question),
      status: review?.status ?? "to_review",
      reason: review?.reason ?? null,
      note: review?.note ?? null,
      retrySelectedAnswer:
        (review?.retry_selected_answer as SatChoiceLabel | null) ?? null,
      retryIsCorrect: review?.retry_is_correct ?? null,
    });
  }

  items.sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  return items;
}

type ActionResult = { success: boolean; error?: string; status?: MistakeStatus };

async function getExistingStatus(
  userId: string,
  attemptId: string,
  questionId: string
): Promise<MistakeStatus | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_mistake_reviews")
    .select("status")
    .eq("user_id", userId)
    .eq("attempt_id", attemptId)
    .eq("question_id", questionId)
    .maybeSingle();

  return (data?.status as MistakeStatus | undefined) ?? null;
}

/** First open of a question: advances to_review -> reviewed only. */
export async function markMistakeReviewed(
  attemptId: string,
  questionId: string
): Promise<ActionResult> {
  const user = await getCachedUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const existing = await getExistingStatus(user.id, attemptId, questionId);
  const nextStatus = advanceStatus(existing, "reviewed");
  if (nextStatus === existing) return { success: true, status: existing };

  const supabase = await createClient();
  const { error } = await supabase.from("user_mistake_reviews").upsert(
    {
      user_id: user.id,
      attempt_id: attemptId,
      question_id: questionId,
      status: nextStatus,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,attempt_id,question_id" }
  );

  if (error) {
    console.error("Failed to mark mistake reviewed:", error);
    return { success: false, error: "Failed to save." };
  }

  return { success: true, status: nextStatus };
}

/** Grades the retry server-side against the real answer key and records it. */
export async function submitMistakeRetry(
  attemptId: string,
  questionId: string,
  selectedAnswer: SatChoiceLabel
): Promise<ActionResult & { isCorrect?: boolean }> {
  const user = await getCachedUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const question = await getQuestionById(questionId);
  if (!question) return { success: false, error: "Unknown question." };

  const isCorrect = selectedAnswer === question.correctAnswer;
  const existing = await getExistingStatus(user.id, attemptId, questionId);
  const nextStatus = isCorrect
    ? advanceStatus(existing, "corrected")
    : advanceStatus(existing, "reviewed");

  const supabase = await createClient();
  const { error } = await supabase.from("user_mistake_reviews").upsert(
    {
      user_id: user.id,
      attempt_id: attemptId,
      question_id: questionId,
      status: nextStatus,
      retry_selected_answer: selectedAnswer,
      retry_is_correct: isCorrect,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,attempt_id,question_id" }
  );

  if (error) {
    console.error("Failed to save retry:", error);
    return { success: false, error: "Failed to save." };
  }

  return { success: true, status: nextStatus, isCorrect };
}

export async function markMistakeMastered(
  attemptId: string,
  questionId: string
): Promise<ActionResult> {
  const user = await getCachedUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase.from("user_mistake_reviews").upsert(
    {
      user_id: user.id,
      attempt_id: attemptId,
      question_id: questionId,
      status: "mastered",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,attempt_id,question_id" }
  );

  if (error) {
    console.error("Failed to mark mistake mastered:", error);
    return { success: false, error: "Failed to save." };
  }

  return { success: true, status: "mastered" };
}

export async function saveMistakeReason(
  attemptId: string,
  questionId: string,
  reason: MistakeReason
): Promise<ActionResult> {
  const user = await getCachedUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase.from("user_mistake_reviews").upsert(
    {
      user_id: user.id,
      attempt_id: attemptId,
      question_id: questionId,
      reason,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,attempt_id,question_id" }
  );

  if (error) {
    console.error("Failed to save mistake reason:", error);
    return { success: false, error: "Failed to save." };
  }

  return { success: true };
}

export async function saveMistakeNote(
  attemptId: string,
  questionId: string,
  note: string
): Promise<ActionResult> {
  const user = await getCachedUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase.from("user_mistake_reviews").upsert(
    {
      user_id: user.id,
      attempt_id: attemptId,
      question_id: questionId,
      note: note.trim().length > 0 ? note.trim() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,attempt_id,question_id" }
  );

  if (error) {
    console.error("Failed to save mistake note:", error);
    return { success: false, error: "Failed to save." };
  }

  return { success: true };
}
