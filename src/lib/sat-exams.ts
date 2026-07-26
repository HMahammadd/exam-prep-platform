import type { SatPracticeExam } from "@/types/sat-exam";

export const SAT_PRACTICE_EXAMS: SatPracticeExam[] = Array.from(
  { length: 10 },
  (_, index) => {
    const id = index + 1;
    const available = id <= 3;

    return {
      id,
      name: `SAT Practice Exam ${id}`,
      status: available ? "available" : "coming-soon",
      questionCount: id === 1 ? 27 : 20,
      timeLimitMinutes: id === 1 ? 32 : 30,
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
