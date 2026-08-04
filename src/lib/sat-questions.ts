import type { SatModuleNumber, SatQuestion } from "@/types/sat-exam";

const EXAM_LOADERS: Record<number, () => Promise<SatQuestion[]>> = {
  1: async () => {
    const { SAT_EXAM_1_QUESTIONS } = await import("./sat-exam-1-questions");
    return SAT_EXAM_1_QUESTIONS;
  },
  2: async () => {
    const { SAT_EXAM_2_QUESTIONS } = await import("./sat-exam-2-questions");
    return SAT_EXAM_2_QUESTIONS;
  },
  3: async () => {
    const { SAT_EXAM_3_QUESTIONS } = await import("./sat-exam-3-questions");
    return SAT_EXAM_3_QUESTIONS;
  },
};

export async function getExamQuestions(examId: number): Promise<SatQuestion[]> {
  const loader = EXAM_LOADERS[examId];
  if (!loader) {
    return [];
  }
  return loader();
}

export async function getExamModuleQuestions(
  examId: number,
  module: SatModuleNumber
): Promise<SatQuestion[]> {
  const questions = await getExamQuestions(examId);
  return questions.filter((question) => question.module === module);
}

export async function getQuestionById(
  questionId: string
): Promise<SatQuestion | undefined> {
  const match = questionId.match(/^exam-(\d+)-q-/);
  if (!match) {
    return undefined;
  }

  const examId = Number(match[1]);
  const questions = await getExamQuestions(examId);
  return questions.find((question) => question.id === questionId);
}
