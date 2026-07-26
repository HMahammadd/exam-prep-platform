"use server";

import { createClient } from "@/lib/supabaseServer";
import { isDimAnswerCorrect } from "@/lib/dim-math/answer-utils";
import { getDimMathQuestions } from "@/lib/dim-math/questions";
import type { DimMathGradeResponse } from "@/types/dim-math";

/**
 * Grades a DIM math test on the server. The answer key lives only in
 * server-side modules, so the client sends its answers here and receives the
 * score plus per-question correctness — the key never reaches the browser.
 */
export async function gradeDimTest(
  chapterId: number,
  answers: Record<string, string | null>
): Promise<DimMathGradeResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const questions = getDimMathQuestions(chapterId);

  let score = 0;
  const results = questions.map((question) => {
    const answer = answers[question.id] ?? null;

    const isCorrect =
      question.questionType === "open"
        ? isDimAnswerCorrect(
            answer,
            question.correctAnswer,
            question.acceptedAnswers
          )
        : answer === question.correctAnswer;

    if (isCorrect) {
      score += 1;
    }

    return {
      questionId: question.id,
      isCorrect,
      correctAnswer: question.correctAnswer,
    };
  });

  return { score, total: questions.length, results };
}
