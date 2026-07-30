"use client";

import { Bookmark } from "lucide-react";

type NavItem = {
  index: number;
  answered: boolean;
  marked: boolean;
};

type SatReviewScreenProps = {
  items: NavItem[];
  moduleNumber?: number;
  onSelectQuestion: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
  studentName: string;
};

export function SatReviewScreen({
  items,
  moduleNumber = 1,
  onSelectQuestion,
  onBack,
  onNext,
  studentName,
}: SatReviewScreenProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto bg-[#f8f9fa]">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-6">
        <h1 className="text-center text-3xl font-semibold text-[#202124]">
          Check Your Work
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-[#5f6368]">
          On test day, you won&apos;t be able to move on to the next module until
          time expires. For these practice questions, you can click{" "}
          <strong className="font-semibold text-[#202124]">Next</strong> when
          you&apos;re ready to move on.
        </p>

        <div className="mt-8 rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-sm font-semibold text-[#202124]">
              Section 1, Module {moduleNumber}: Reading and Writing Questions
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#5f6368]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-4 w-4 rounded border border-dashed border-[#9aa0a6]" />
                Unanswered
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Bookmark
                  className="h-3.5 w-3.5 fill-red-600 text-red-600"
                  aria-hidden
                />
                For Review
              </span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-5 gap-2.5 sm:grid-cols-10">
            {items.map((item) => (
              <button
                key={item.index}
                type="button"
                onClick={() => onSelectQuestion(item.index)}
                className={`relative flex h-10 w-full items-center justify-center rounded text-sm font-semibold ${
                  item.answered
                    ? "bg-[#3b5998] text-white"
                    : "border border-dashed border-[#9aa0a6] bg-white text-[#3b5998]"
                }`}
                aria-label={`Question ${item.index + 1}`}
              >
                {item.index + 1}
                {item.marked && (
                  <Bookmark
                    className="absolute -right-1 -top-1 h-3.5 w-3.5 fill-red-600 text-red-600"
                    aria-hidden
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <footer className="shrink-0 border-t border-dashed border-[#9aa0a6] bg-[#f8f9fa] px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className="text-sm font-medium text-[#202124]">{studentName}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onBack}
              className="rounded-full bg-[#3b5998] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#334e86]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onNext}
              className="rounded-full bg-[#3b5998] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#334e86]"
            >
              Next
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
