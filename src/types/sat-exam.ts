export type SatChoiceLabel = "A" | "B" | "C" | "D";

export type SatExamStatus = "available" | "coming-soon";

export type SatPracticeExam = {
  id: number;
  name: string;
  status: SatExamStatus;
  questionCount: number;
  /** Minutes allowed per Reading and Writing module */
  timeLimitMinutes: number;
  moduleCount: number;
};

export type SatModuleNumber = 1 | 2;

export type SatChartId =
  | "exam1-lok-sabha"
  | "exam1-fatty-liver"
  | "exam2-pigeons"
  | "exam2-fruit-drinks"
  | "exam2-social-exclusion"
  | "exam3-presidents"
  | "exam3-tourism"
  | "exam3-hurricanes"
  | "exam3-shopping";

export type SatQuestion = {
  id: string;
  examId: number;
  module: SatModuleNumber;
  section: string;
  passage: string;
  /** Optional figure/chart shown with the passage */
  passageImageUrl?: string;
  /** Optional interactive chart rendered with Recharts */
  chartId?: SatChartId;
  questionText: string;
  choices: { label: SatChoiceLabel; text: string }[];
  correctAnswer: SatChoiceLabel;
  explanation: string;
};

/**
 * SAT question with the answer key and explanation removed. This is the only
 * shape that may be sent to the exam-taking client — grading happens on the
 * server so `correctAnswer` must never reach the browser during an exam.
 */
export type SatClientQuestion = Omit<SatQuestion, "correctAnswer" | "explanation">;

export type SatExamAnswerInput = {
  questionId: string;
  selectedAnswer: SatChoiceLabel | null;
  markedForReview: boolean;
};

export type SatExamAttemptSummary = {
  lastScore: number | null;
  lastTotal: number | null;
  bestScore: number | null;
  bestTotal: number | null;
  lastCompletedAt: string | null;
  lastAttemptId: string | null;
};

export type SubmitSatExamInput = {
  examId: string;
  answers: SatExamAnswerInput[];
  timeSpentSeconds: number;
};

export type SubmitSatExamResult =
  | {
      success: true;
      attemptId: string;
      score: number;
      totalQuestions: number;
      percentage: number;
      /** When true, client must persist attempt via localStorage */
      local?: true;
      localAttempt?: {
        id: string;
        exam_id: string;
        score: number;
        total_questions: number;
        percentage: number;
        time_spent_seconds: number;
        completed_at: string;
        answers: {
          id: string;
          question_id: string;
          selected_answer: string | null;
          correct_answer: string;
          is_correct: boolean;
          marked_for_review: boolean;
        }[];
      };
    }
  | { success: false; error: string };
