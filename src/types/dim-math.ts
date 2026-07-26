export type DimChoiceLabel = "A" | "B" | "C" | "D" | "E";

export type DimMathQuestionType = "multiple-choice" | "open";

export type DimMathDiagramId = "sinaq-10-q11" | "sinaq-10-q19";

export type DimMathQuestion = {
  id: string;
  chapterId: number;
  testName: string;
  questionNumber: number;
  questionText: string;
  questionType: DimMathQuestionType;
  diagramId?: DimMathDiagramId;
  choices?: { label: DimChoiceLabel; text: string }[];
  correctAnswer: string;
  acceptedAnswers?: string[];
};

/**
 * DIM question with the answer key removed. This is the only shape that may be
 * sent to the test-taking client — grading happens on the server so
 * `correctAnswer` / `acceptedAnswers` never reach the browser.
 */
export type DimMathClientQuestion = Omit<
  DimMathQuestion,
  "correctAnswer" | "acceptedAnswers"
>;

export type DimMathGradedResult = {
  questionId: string;
  isCorrect: boolean;
  correctAnswer: string;
};

export type DimMathGradeResponse = {
  score: number;
  total: number;
  results: DimMathGradedResult[];
};

export const DIM_CHOICE_LABELS: DimChoiceLabel[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
];
