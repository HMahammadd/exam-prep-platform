export function normalizeDimAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/,/g, ".")
    .replace(/×/g, "*")
    .replace(/·/g, "*")
    .replace(/√/g, "sqrt")
    .replace(/π/g, "pi");
}

export function isDimAnswerCorrect(
  userAnswer: string | null,
  correctAnswer: string,
  acceptedAnswers?: string[]
): boolean {
  if (!userAnswer?.trim()) {
    return false;
  }

  const normalizedUser = normalizeDimAnswer(userAnswer);
  const validAnswers = [correctAnswer, ...(acceptedAnswers ?? [])].map(
    normalizeDimAnswer
  );

  return validAnswers.includes(normalizedUser);
}

export function formatDimCorrectAnswer(question: {
  questionType: string;
  correctAnswer: string;
}): string {
  return question.correctAnswer;
}
