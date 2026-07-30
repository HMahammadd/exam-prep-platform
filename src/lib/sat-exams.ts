import type { SatPracticeExam } from "@/types/sat-exam";

const MODULE_MINUTES = 32;
const QUESTIONS_PER_MODULE = 27;
const MODULE_COUNT = 2;

export const SAT_PRACTICE_EXAMS: SatPracticeExam[] = Array.from(
  { length: 10 },
  (_, index) => {
    const id = index + 1;
    const available = id <= 3;

    return {
      id,
      name: `SAT Practice Exam ${id}`,
      status: available ? "available" : "coming-soon",
      questionCount: available ? QUESTIONS_PER_MODULE * MODULE_COUNT : 20,
      timeLimitMinutes: MODULE_MINUTES,
      moduleCount: available ? MODULE_COUNT : 1,
    };
  }
);

export function getSatExamById(examId: number): SatPracticeExam | undefined {
  return SAT_PRACTICE_EXAMS.find((exam) => exam.id === examId);
}

export function isSatExamAvailable(examId: number): boolean {
  const exam = getSatExamById(examId);
  return exam?.status === "available";
}
