"use client";

import { MapPin } from "lucide-react";
import type { ReviewQuestionItem, ReviewStatus } from "@/lib/sat-review";

const STATUS_BOX_STYLES: Record<ReviewStatus, string> = {
  correct:
    "border-2 border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  wrong:
    "border-2 border-red-500 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  missed:
    "border-2 border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
};

type SatReviewQuestionGridProps = {
  items: ReviewQuestionItem[];
  selectedQuestionId: string | null;
  onSelect: (questionId: string) => void;
};

export function SatReviewQuestionGrid({
  items,
  selectedQuestionId,
  onSelect,
}: SatReviewQuestionGridProps) {
  if (items.length === 0) {
    return (
      <p className="px-1 py-2 text-xs text-muted">
        No questions in this module
      </p>
    );
  }

  return (
    <div className="grid grid-cols-7 gap-1.5 pt-3 sm:grid-cols-9">
      {items.map((item) => {
        const isCurrent = item.question.id === selectedQuestionId;

        return (
          <div
            key={item.question.id}
            className="relative flex justify-center"
          >
            {isCurrent ? (
              <MapPin
                className="pointer-events-none absolute -top-3 left-1/2 z-10 h-3 w-3 -translate-x-1/2 text-[#3b5998]"
                aria-hidden
              />
            ) : null}
            <button
              type="button"
              onClick={() => onSelect(item.question.id)}
              aria-label={`Question ${item.questionNumber}, ${item.status}${
                isCurrent ? ", selected" : ""
              }`}
              aria-current={isCurrent ? "true" : undefined}
              className={`flex h-7 w-7 items-center justify-center rounded text-[11px] font-semibold transition ${
                STATUS_BOX_STYLES[item.status]
              } ${isCurrent ? "ring-2 ring-[#3b5998] ring-offset-1" : ""}`}
            >
              {item.questionNumber}
            </button>
          </div>
        );
      })}
    </div>
  );
}
