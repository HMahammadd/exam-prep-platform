export type PracticeChoice = {
  id: string;
  label: string;
  choiceText: string;
};

export type PracticeQuestion = {
  id: string;
  questionText: string;
  difficulty: string;
  choices: PracticeChoice[];
};

export type StartPracticeResult =
  | {
      success: true;
      sessionId: string;
      questions: PracticeQuestion[];
    }
  | { success: false; error: string };

export type SubmitAnswerResult =
  | {
      success: true;
      isCorrect: boolean;
      explanation: string;
      correctLabel: string;
    }
  | { success: false; error: string };
