import type { ComponentType } from "react";
import { Sve00001dTable } from "@/components/sat/question-visuals/Sve00001dTable";

const QUESTION_VISUALS: Record<string, ComponentType> = {
  SVE00001D: Sve00001dTable,
};

export function hasQuestionVisual(questionCode: string | null | undefined) {
  return Boolean(questionCode && QUESTION_VISUALS[questionCode]);
}

export function QuestionVisual({
  questionCode,
}: {
  questionCode: string | null | undefined;
}) {
  if (!questionCode) {
    return null;
  }

  const Visual = QUESTION_VISUALS[questionCode];
  if (!Visual) {
    return null;
  }

  return (
    <div className="max-w-3xl">
      <Visual />
    </div>
  );
}
