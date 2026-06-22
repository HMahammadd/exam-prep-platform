"use server";

import { createClient } from "@/lib/supabaseServer";
import type {
  PracticeQuestion,
  StartPracticeResult,
  SubmitAnswerResult,
} from "@/types/practice";

const PRACTICE_QUESTION_LIMIT = 10;

type QuestionRow = {
  id: string;
  question_text: string;
  difficulty: string;
  answer_choices: {
    id: string;
    label: string;
    choice_text: string;
    display_order: number;
  }[];
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function mapQuestion(row: QuestionRow): PracticeQuestion {
  return {
    id: row.id,
    questionText: row.question_text,
    difficulty: row.difficulty,
    choices: [...row.answer_choices]
      .sort((a, b) => a.display_order - b.display_order)
      .map((choice) => ({
        id: choice.id,
        label: choice.label,
        choiceText: choice.choice_text,
      })),
  };
}

export async function startPractice(
  exam: string,
  topic: string
): Promise<StartPracticeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to practice." };
  }

  const { data: questionRows, error: questionsError } = await supabase
    .from("questions")
    .select(
      `
      id,
      question_text,
      difficulty,
      answer_choices (
        id,
        label,
        choice_text,
        display_order
      )
    `
    )
    .eq("exam", exam)
    .eq("topic", topic)
    .eq("status", "published");

  if (questionsError) {
    return { success: false, error: questionsError.message };
  }

  if (!questionRows?.length) {
    return {
      success: false,
      error: "No published questions found for this exam and topic.",
    };
  }

  const questions = shuffle(questionRows as QuestionRow[])
    .slice(0, PRACTICE_QUESTION_LIMIT)
    .map(mapQuestion);

  const { data: session, error: sessionError } = await supabase
    .from("practice_sessions")
    .insert({
      user_id: user.id,
      exam,
      topic,
      question_count: questions.length,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    return {
      success: false,
      error: sessionError?.message ?? "Failed to start practice session.",
    };
  }

  return {
    success: true,
    sessionId: session.id,
    questions,
  };
}

export async function submitAnswer(
  sessionId: string,
  questionId: string,
  selectedChoiceId: string
): Promise<SubmitAnswerResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in." };
  }

  const { data: session, error: sessionError } = await supabase
    .from("practice_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !session) {
    return { success: false, error: "Practice session not found." };
  }

  const { data: question, error: questionError } = await supabase
    .from("questions")
    .select(
      `
      id,
      explanation,
      answer_choices (
        id,
        label,
        is_correct
      )
    `
    )
    .eq("id", questionId)
    .eq("status", "published")
    .single();

  if (questionError || !question) {
    return { success: false, error: "Question not found." };
  }

  const choices = question.answer_choices as {
    id: string;
    label: string;
    is_correct: boolean;
  }[];

  const selectedChoice = choices.find((choice) => choice.id === selectedChoiceId);
  const correctChoice = choices.find((choice) => choice.is_correct);

  if (!selectedChoice || !correctChoice) {
    return { success: false, error: "Invalid answer choice." };
  }

  const { error: attemptError } = await supabase.from("question_attempts").insert({
    session_id: sessionId,
    user_id: user.id,
    question_id: questionId,
    selected_choice_id: selectedChoiceId,
    is_correct: selectedChoice.is_correct,
  });

  if (attemptError) {
    return { success: false, error: attemptError.message };
  }

  return {
    success: true,
    isCorrect: selectedChoice.is_correct,
    explanation: question.explanation,
    correctLabel: correctChoice.label,
  };
}

export async function completePracticeSession(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in." };
  }

  const { error } = await supabase
    .from("practice_sessions")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
