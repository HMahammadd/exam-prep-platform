import type { SatModuleNumber, SatQuestion } from "@/types/sat-exam";
import { SAT_EXAM_1_QUESTIONS } from "./sat-exam-1-questions";
import { SAT_EXAM_2_QUESTIONS } from "./sat-exam-2-questions";
import { SAT_EXAM_3_QUESTIONS } from "./sat-exam-3-questions";

const EXAM_QUESTIONS: Record<number, SatQuestion[]> = {
  1: SAT_EXAM_1_QUESTIONS,
  2: SAT_EXAM_2_QUESTIONS,
  3: SAT_EXAM_3_QUESTIONS,
};

export function getExamQuestions(examId: number): SatQuestion[] {
  return EXAM_QUESTIONS[examId] ?? [];
}

export function getExamModuleQuestions(
  examId: number,
  module: SatModuleNumber
): SatQuestion[] {
  return getExamQuestions(examId).filter((question) => question.module === module);
}

export function getQuestionById(questionId: string): SatQuestion | undefined {
  const match = questionId.match(/^exam-(\d+)-q-/);
  if (!match) {
    return undefined;
  }

  const examId = Number(match[1]);
  return getExamQuestions(examId).find((question) => question.id === questionId);
}
