"use server";

import { createClient } from "@/lib/supabaseServer";
import { createGradingClient } from "@/lib/supabaseAdmin";
import { getExamQuestions } from "@/lib/sat-questions";
import { calculatePercentage } from "@/lib/sat-utils";
import { isSatExamAvailable } from "@/lib/sat-exams";
import type {
  SatExamAttemptSummary,
  SubmitSatExamInput,
  SubmitSatExamResult,
} from "@/types/sat-exam";

type AttemptRow = {
  id: string;
  exam_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
};

export async function getSatExamSummaries(): Promise<
  Record<string, SatExamAttemptSummary>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {};
  }

  const { data, error } = await supabase
    .from("sat_exam_attempts")
    .select("id, exam_id, score, total_questions, completed_at")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false });

  if (error || !data) {
    return {};
  }

  const summaries: Record<string, SatExamAttemptSummary> = {};

  for (const attempt of data as AttemptRow[]) {
    const existing = summaries[attempt.exam_id];

    if (!existing) {
      summaries[attempt.exam_id] = {
        lastScore: attempt.score,
        lastTotal: attempt.total_questions,
        bestScore: attempt.score,
        bestTotal: attempt.total_questions,
        lastCompletedAt: attempt.completed_at,
        lastAttemptId: attempt.id,
      };
      continue;
    }

    if (
      existing.bestScore === null ||
      attempt.score > existing.bestScore
    ) {
      existing.bestScore = attempt.score;
      existing.bestTotal = attempt.total_questions;
    }
  }

  return summaries;
}

export async function submitSatExam(
  input: SubmitSatExamInput
): Promise<SubmitSatExamResult> {
  const examId = Number(input.examId);

  if (!isSatExamAvailable(examId)) {
    return { success: false, error: "This exam is not available yet." };
  }

  const questions = getExamQuestions(examId);

  if (!questions.length) {
    return { success: false, error: "No questions found for this exam." };
  }

  if (input.answers.length !== questions.length) {
    return {
      success: false,
      error: "Please answer all questions before submitting.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in." };
  }

  let score = 0;
  const answerRows = input.answers.map((answer) => {
    const question = questions.find((item) => item.id === answer.questionId);

    if (!question) {
      throw new Error(`Unknown question: ${answer.questionId}`);
    }

    const isCorrect = answer.selectedAnswer === question.correctAnswer;

    if (isCorrect) {
      score += 1;
    }

    return {
      question_id: question.id,
      selected_answer: answer.selectedAnswer,
      correct_answer: question.correctAnswer,
      is_correct: isCorrect,
      marked_for_review: answer.markedForReview,
    };
  });

  const totalQuestions = questions.length;
  const percentage = calculatePercentage(score, totalQuestions);
  const completedAt = new Date().toISOString();

  function buildLocalResult(attemptId: string): SubmitSatExamResult {
    return {
      success: true,
      attemptId,
      local: true,
      localAttempt: {
        id: attemptId,
        exam_id: String(examId),
        score,
        total_questions: totalQuestions,
        percentage,
        time_spent_seconds: input.timeSpentSeconds,
        completed_at: completedAt,
        answers: answerRows.map((row, index) => ({
          id: `${attemptId}-a-${index + 1}`,
          ...row,
        })),
      },
    };
  }

  // Scores are written with the service role so that clients cannot forge
  // attempt rows directly against PostgREST (RLS blocks their inserts).
  const db = await createGradingClient();

  const { data: attempt, error: attemptError } = await db
    .from("sat_exam_attempts")
    .insert({
      user_id: user.id,
      exam_id: String(examId),
      score,
      total_questions: totalQuestions,
      percentage,
      time_spent_seconds: input.timeSpentSeconds,
    })
    .select("id")
    .single();

  if (attemptError || !attempt) {
    const message = attemptError?.message ?? "";
    const missingTable =
      /sat_exam_attempts|schema cache|does not exist|Could not find the table/i.test(
        message
      );

    if (missingTable) {
      return buildLocalResult(`local-${crypto.randomUUID()}`);
    }

    console.error("Failed to save SAT exam attempt:", attemptError);
    return { success: false, error: "Failed to save exam attempt." };
  }

  const { error: answersError } = await db.from("sat_exam_answers").insert(
    answerRows.map((row) => ({
      attempt_id: attempt.id,
      ...row,
    }))
  );

  if (answersError) {
    await db.from("sat_exam_attempts").delete().eq("id", attempt.id);
    const message = answersError.message ?? "";
    const missingTable =
      /sat_exam_answers|schema cache|does not exist|Could not find the table/i.test(
        message
      );

    if (missingTable) {
      return buildLocalResult(`local-${crypto.randomUUID()}`);
    }

    console.error("Failed to save SAT exam answers:", answersError);
    return { success: false, error: "Failed to save exam answers." };
  }

  return { success: true, attemptId: attempt.id };
}

export async function getSatExamAttempt(attemptId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: attempt, error } = await supabase
    .from("sat_exam_attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .single();

  if (error || !attempt) {
    return null;
  }

  const { data: answers } = await supabase
    .from("sat_exam_answers")
    .select("*")
    .eq("attempt_id", attemptId)
    .order("created_at", { ascending: true });

  return { attempt, answers: answers ?? [] };
}

export async function getLatestSatExamAttempt(examId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: attempt, error } = await supabase
    .from("sat_exam_attempts")
    .select("*")
    .eq("user_id", user.id)
    .eq("exam_id", String(examId))
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !attempt) {
    return null;
  }

  const { data: answers } = await supabase
    .from("sat_exam_answers")
    .select("*")
    .eq("attempt_id", attempt.id)
    .order("created_at", { ascending: true });

  return { attempt, answers: answers ?? [] };
}
