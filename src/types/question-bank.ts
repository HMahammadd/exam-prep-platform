export type QuestionBankType = "multiple-choice" | "open";
export type QuestionBankStatus = "draft" | "published";
export type QuestionBankDifficulty = "easy" | "medium" | "hard";

export type QuestionBankChoice = {
  id?: string;
  label: string;
  choiceText: string;
  isCorrect: boolean;
  displayOrder: number;
};

export type QuestionBankItem = {
  id: string;
  examType: string;
  section: string | null;
  groupKey: string;
  groupLabel: string | null;
  questionNumber: number;
  questionType: QuestionBankType;
  passage: string | null;
  questionText: string;
  imageUrl: string | null;
  correctAnswer: string;
  acceptedAnswers: string[];
  explanation: string | null;
  difficulty: QuestionBankDifficulty | null;
  status: QuestionBankStatus;
  createdAt: string;
  updatedAt: string;
  choices: QuestionBankChoice[];
};

export type AdminActionResult =
  | { success: true; questionId?: string }
  | { success: false; error: string };

/** Shape of a row returned by Supabase for `exam_questions`. */
export type ExamQuestionRow = {
  id: string;
  exam_type: string;
  section: string | null;
  group_key: string;
  group_label: string | null;
  question_number: number;
  question_type: QuestionBankType;
  passage: string | null;
  question_text: string;
  image_url: string | null;
  correct_answer: string;
  accepted_answers: string[] | null;
  explanation: string | null;
  difficulty: QuestionBankDifficulty | null;
  status: QuestionBankStatus;
  created_at: string;
  updated_at: string;
};

export type ExamQuestionChoiceRow = {
  id: string;
  question_id: string;
  label: string;
  choice_text: string;
  is_correct: boolean;
  display_order: number;
};

export function mapQuestionRow(
  row: ExamQuestionRow,
  choices: ExamQuestionChoiceRow[] = []
): QuestionBankItem {
  return {
    id: row.id,
    examType: row.exam_type,
    section: row.section,
    groupKey: row.group_key,
    groupLabel: row.group_label,
    questionNumber: row.question_number,
    questionType: row.question_type,
    passage: row.passage,
    questionText: row.question_text,
    imageUrl: row.image_url,
    correctAnswer: row.correct_answer,
    acceptedAnswers: row.accepted_answers ?? [],
    explanation: row.explanation,
    difficulty: row.difficulty,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    choices: [...choices]
      .sort((a, b) => a.display_order - b.display_order)
      .map((choice) => ({
        id: choice.id,
        label: choice.label,
        choiceText: choice.choice_text,
        isCorrect: choice.is_correct,
        displayOrder: choice.display_order,
      })),
  };
}
