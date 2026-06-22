"use server";

import { createClient } from "@/lib/supabaseServer";
import {
  CHOICE_LABELS,
  type CreateQuestionInput,
  type QuestionDifficulty,
  type QuestionStatus,
} from "@/types/question";

export type CreateQuestionResult =
  | { success: true; questionId: string }
  | { success: false; error: string };

function validateInput(input: CreateQuestionInput): string | null {
  if (!input.questionText.trim()) {
    return "Question text is required.";
  }

  if (!input.explanation.trim()) {
    return "Explanation is required.";
  }

  if (!input.exam.trim()) {
    return "Exam is required.";
  }

  if (!input.topic.trim()) {
    return "Topic is required.";
  }

  if (input.choices.length !== 4) {
    return "Exactly four answer choices are required.";
  }

  if (input.choices.some((choice) => !choice.trim())) {
    return "All four answer choices are required.";
  }

  if (input.correctIndex < 0 || input.correctIndex > 3) {
    return "Exactly one correct answer is required.";
  }

  return null;
}

export async function createQuestion(
  input: CreateQuestionInput
): Promise<CreateQuestionResult> {
  const validationError = validateInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to create questions." };
  }

  const { data: question, error: questionError } = await supabase
    .from("questions")
    .insert({
      exam: input.exam.trim(),
      topic: input.topic.trim(),
      difficulty: input.difficulty as QuestionDifficulty,
      question_text: input.questionText.trim(),
      explanation: input.explanation.trim(),
      status: input.status as QuestionStatus,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (questionError || !question) {
    return {
      success: false,
      error: questionError?.message ?? "Failed to save question.",
    };
  }

  const answerRows = input.choices.map((choiceText, index) => ({
    question_id: question.id,
    label: CHOICE_LABELS[index],
    choice_text: choiceText.trim(),
    is_correct: index === input.correctIndex,
    display_order: index,
  }));

  const { error: choicesError } = await supabase
    .from("answer_choices")
    .insert(answerRows);

  if (choicesError) {
    await supabase.from("questions").delete().eq("id", question.id);
    return {
      success: false,
      error: choicesError.message ?? "Failed to save answer choices.",
    };
  }

  return { success: true, questionId: question.id };
}
