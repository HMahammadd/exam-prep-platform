export type QuestionDifficulty = "easy" | "medium" | "hard";
export type QuestionStatus = "draft" | "published";

export type CreateQuestionInput = {
  exam: string;
  topic: string;
  difficulty: QuestionDifficulty;
  questionText: string;
  explanation: string;
  status: QuestionStatus;
  choices: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};

export const EXAM_OPTIONS = ["SAT"] as const;

export const TOPIC_OPTIONS = [
  "Reading Comprehension",
  "Grammar",
  "Vocabulary in Context",
  "Expression of Ideas",
  "Standard English Conventions",
] as const;

export const DIFFICULTY_OPTIONS: QuestionDifficulty[] = [
  "easy",
  "medium",
  "hard",
];

export const STATUS_OPTIONS: QuestionStatus[] = ["draft", "published"];

export const CHOICE_LABELS = ["A", "B", "C", "D"] as const;
