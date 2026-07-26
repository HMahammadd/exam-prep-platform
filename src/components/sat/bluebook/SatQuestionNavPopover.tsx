"use client";

import { Bookmark, MapPin, X } from "lucide-react";

type NavItem = {
  index: number;
  answered: boolean;
  marked: boolean;
  current: boolean;
};

type SatQuestionNavPopoverProps = {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
  onSelect: (index: number) => void;
  onGoToReview: () => void;
};

export function SatQuestionNavPopover({
  open,
  onClose,
  items,
  onSelect,
  onGoToReview,
}: SatQuestionNavPopoverProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Question navigation"
        className="relative w-full max-w-lg rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded p-1 text-[#5f6368] hover:bg-[#f1f3f4]"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="pr-8 text-center text-sm font-semibold text-[#202124]">
          Section 1, Module 1: Reading and Writing Questions
        </h3>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-[#5f6368]">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#3b5998]" aria-hidden />
            Current
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-4 w-4 rounded border border-dashed border-[#9aa0a6]" />
            Unanswered
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Bookmark className="h-3.5 w-3.5 fill-red-600 text-red-600" aria-hidden />
            For Review
          </span>
        </div>

        <div className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-9">
          {items.map((item) => (
            <div key={item.index} className="relative flex flex-col items-center">
              {item.current && (
                <MapPin
                  className="absolute -top-4 h-3.5 w-3.5 text-[#3b5998]"
                  aria-hidden
                />
              )}
              <button
                type="button"
                onClick={() => {
                  onSelect(item.index);
                  onClose();
                }}
                className={`relative flex h-9 w-9 items-center justify-center rounded text-sm font-semibold ${
                  item.answered
                    ? "bg-[#3b5998] text-white"
                    : "border border-dashed border-[#9aa0a6] bg-white text-[#202124]"
                } ${item.current && !item.answered ? "ring-2 ring-[#3b5998]/30" : ""}`}
              >
                {item.index + 1}
                {item.marked && (
                  <Bookmark
                    className="absolute -right-1 -top-1 h-3.5 w-3.5 fill-red-600 text-red-600"
                    aria-hidden
                  />
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => {
              onGoToReview();
              onClose();
            }}
            className="rounded-full border border-[#3b5998] px-5 py-2 text-sm font-semibold text-[#3b5998] hover:bg-[#eef2fb]"
          >
            Go to Review Page
          </button>
        </div>
      </div>
    </div>
  );
}
