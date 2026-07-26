"use client";

import { memo } from "react";
import type { DimMathClientQuestion } from "@/types/dim-math";
import { DimMathContent } from "./DimMathContent";
import { DimMathDiagram } from "./DimMathDiagram";

type DimMathQuestionStemProps = {
  question: DimMathClientQuestion;
};

/** Memoized question body — KaTeX only re-renders when the active question changes. */
export const DimMathQuestionStem = memo(
  function DimMathQuestionStem({ question }: DimMathQuestionStemProps) {
    return (
      <>
        {question.diagramId && (
          <DimMathDiagram diagramId={question.diagramId} />
        )}
        <DimMathContent
          text={question.questionText}
          className="text-base leading-relaxed text-foreground"
        />
      </>
    );
  },
  (prev, next) => prev.question.id === next.question.id
);
