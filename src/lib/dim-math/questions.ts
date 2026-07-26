import type { DimMathQuestion } from "@/types/dim-math";
import { NATURAL_EDEDLER_TEST_A } from "./natural-ededler-test-a";
import { SINAQ_10_QEBUL } from "./sinaq-10-qebul";

const CHAPTER_QUESTIONS: Record<number, DimMathQuestion[]> = {
  1: NATURAL_EDEDLER_TEST_A,
  37: SINAQ_10_QEBUL,
};

export function getDimMathQuestions(chapterId: number): DimMathQuestion[] {
  return CHAPTER_QUESTIONS[chapterId] ?? [];
}

export function getDimMathQuestionById(
  questionId: string
): DimMathQuestion | undefined {
  for (const questions of Object.values(CHAPTER_QUESTIONS)) {
    const found = questions.find((question) => question.id === questionId);
    if (found) {
      return found;
    }
  }
  return undefined;
}
