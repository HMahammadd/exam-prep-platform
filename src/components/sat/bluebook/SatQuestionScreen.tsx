"use client";

import Image from "next/image";
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Highlighter,
  MoreVertical,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { SatChoiceLabel, SatClientQuestion } from "@/types/sat-exam";
import { SatQuestionNavPopover } from "./SatQuestionNavPopover";

type SatQuestionScreenProps = {
  question: SatClientQuestion;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: SatChoiceLabel | null;
  marked: boolean;
  eliminated: SatChoiceLabel[];
  studentName: string;
  onSelectAnswer: (label: SatChoiceLabel) => void;
  onToggleMark: () => void;
  onToggleEliminate: (label: SatChoiceLabel) => void;
  onBack: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
  navItems: {
    index: number;
    answered: boolean;
    marked: boolean;
    current: boolean;
  }[];
  onGoToQuestion: (index: number) => void;
  onGoToReview: () => void;
};

export function SatQuestionScreen({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  marked,
  eliminated,
  studentName,
  onSelectAnswer,
  onToggleMark,
  onToggleEliminate,
  onBack,
  onNext,
  isFirst,
  isLast,
  navItems,
  onGoToQuestion,
  onGoToReview,
}: SatQuestionScreenProps) {
  const [leftPercent, setLeftPercent] = useState(50);
  const [navOpen, setNavOpen] = useState(false);
  const [directionsOpen, setDirectionsOpen] = useState(false);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((event: MouseEvent) => {
    if (!dragging.current || !containerRef.current) {
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const percent = ((event.clientX - rect.left) / rect.width) * 100;
    setLeftPercent(Math.min(70, Math.max(30, percent)));
  }, []);

  const stopDrag = useCallback(() => {
    dragging.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, [onMouseMove, stopDrag]);

  const startDrag = (event: ReactMouseEvent) => {
    event.preventDefault();
    dragging.current = true;
  };

  const eliminatedSet = useMemo(() => new Set(eliminated), [eliminated]);

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f8f9fa]">
        {/* Optional directions (kept lightweight) */}
        {directionsOpen && (
          <div className="border-b border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#5f6368] sm:px-6">
            Read each passage and question carefully. Choose the best answer
            based only on the information provided.
          </div>
        )}

        <div
          ref={containerRef}
          className="mx-3 my-3 flex min-h-0 flex-1 overflow-hidden rounded border border-dashed border-[#9aa0a6] bg-white sm:mx-4"
        >
          {/* Passage pane */}
          <section
            className="min-h-0 overflow-auto p-5 sm:p-6"
            style={{ width: `${leftPercent}%` }}
          >
            <p
              className="whitespace-pre-line text-[17px] leading-8 text-[#202124]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {question.passage}
            </p>
            {question.passageImageUrl && (
              <div className="relative mt-4 w-full max-w-lg overflow-hidden rounded border border-[#e5e7eb] bg-white">
                <Image
                  src={question.passageImageUrl}
                  alt="Figure for this question"
                  width={960}
                  height={640}
                  className="h-auto w-full"
                />
              </div>
            )}
          </section>

          {/* Divider */}
          <div
            role="separator"
            aria-orientation="vertical"
            onMouseDown={startDrag}
            className="relative flex w-3 shrink-0 cursor-col-resize items-center justify-center bg-[#e8eaed]"
          >
            <span className="flex h-10 w-4 items-center justify-center rounded-sm bg-[#5f6368] text-white">
              <GripVertical className="h-3.5 w-3.5" aria-hidden />
            </span>
          </div>

          {/* Question pane */}
          <section
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto p-5 sm:p-6"
            style={{ width: `${100 - leftPercent}%` }}
          >
            <div className="mb-4 flex items-center gap-3 border-b border-dashed border-[#c4c7cc] pb-3">
              <span className="flex h-8 w-8 items-center justify-center bg-black text-sm font-bold text-white">
                {questionIndex + 1}
              </span>
              <button
                type="button"
                onClick={onToggleMark}
                className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                  marked ? "text-red-600" : "text-[#202124]"
                }`}
              >
                <Bookmark
                  className={`h-4 w-4 ${marked ? "fill-red-600 text-red-600" : ""}`}
                  aria-hidden
                />
                Mark for Review
              </button>
              <div className="ml-auto flex items-center gap-2 text-[#5f6368]">
                <span className="text-xs font-semibold tracking-wide">ABC</span>
                <span className="h-px w-8 border-t border-dashed border-[#9aa0a6]" />
              </div>
            </div>

            {/* Hidden directions toggle used from header via prop would be better; local toggle for completeness */}
            <button
              type="button"
              className="sr-only"
              onClick={() => setDirectionsOpen((v) => !v)}
            >
              Directions
            </button>

            <h2 className="mb-4 text-base font-medium leading-relaxed text-[#202124]">
              {question.questionText}
            </h2>

            <div className="space-y-3">
              {question.choices.map((choice) => {
                const isEliminated = eliminatedSet.has(choice.label);
                const isSelected = selectedAnswer === choice.label;

                return (
                  <div
                    key={choice.label}
                    className={`flex items-stretch gap-2 rounded-lg border ${
                      isSelected && !isEliminated
                        ? "border-[#3b5998] bg-[#eef2fb]"
                        : "border-[#dadce0] bg-white"
                    } ${isEliminated ? "opacity-60" : ""}`}
                  >
                    <button
                      type="button"
                      disabled={isEliminated}
                      onClick={() => onSelectAnswer(choice.label)}
                      className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left disabled:cursor-not-allowed"
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                          isSelected && !isEliminated
                            ? "border-[#3b5998] bg-[#3b5998] text-white"
                            : "border-[#5f6368] text-[#202124]"
                        } ${isEliminated ? "line-through" : ""}`}
                      >
                        {choice.label}
                      </span>
                      <span
                        className={`min-w-0 text-sm text-[#202124] ${
                          isEliminated ? "line-through" : ""
                        }`}
                        style={{
                          fontFamily: "Georgia, 'Times New Roman', serif",
                        }}
                      >
                        {choice.text}
                      </span>
                    </button>

                    {isEliminated ? (
                      <button
                        type="button"
                        onClick={() => onToggleEliminate(choice.label)}
                        className="shrink-0 px-3 text-sm font-bold text-[#202124] underline"
                      >
                        Undo
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onToggleEliminate(choice.label)}
                        aria-label={`Eliminate option ${choice.label}`}
                        className="mr-2 flex w-10 shrink-0 items-center justify-center self-center text-[#5f6368] hover:text-[#202124]"
                      >
                        <span className="relative flex h-7 w-7 items-center justify-center rounded-full border border-[#5f6368] text-xs font-semibold">
                          {choice.label}
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="h-px w-7 rotate-[-35deg] bg-[#5f6368]" />
                          </span>
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <footer className="shrink-0 border-t border-dashed border-[#9aa0a6] bg-[#f8f9fa] px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3">
          <p className="min-w-0 truncate text-sm font-medium text-[#202124]">
            {studentName}
          </p>

          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#1a2b4c] px-4 py-2 text-sm font-semibold text-white"
          >
            Question {questionIndex + 1} of {totalQuestions}
            <ChevronUp className="h-4 w-4" aria-hidden />
          </button>

          <div className="flex gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={onBack}
                className="rounded-full bg-[#3b5998] px-5 py-2 text-sm font-semibold text-white hover:bg-[#334e86]"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={onNext}
              className="rounded-full bg-[#3b5998] px-5 py-2 text-sm font-semibold text-white hover:bg-[#334e86]"
            >
              {isLast ? "Next" : "Next"}
            </button>
          </div>
        </div>
      </footer>

      <SatQuestionNavPopover
        open={navOpen}
        onClose={() => setNavOpen(false)}
        items={navItems}
        onSelect={onGoToQuestion}
        onGoToReview={onGoToReview}
      />

      {/* Directions control exposed for header — parent can ignore; keep local state sync via data attribute unused */}
      <button
        type="button"
        id="sat-directions-toggle"
        className="hidden"
        onClick={() => setDirectionsOpen((v) => !v)}
        data-open={directionsOpen}
      />
    </>
  );
}

/** Compact header tools used by the shell */
export function SatExamHeaderTools({
  directionsOpen,
  onToggleDirections,
}: {
  directionsOpen: boolean;
  onToggleDirections: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggleDirections}
      className="inline-flex items-center gap-1 text-sm text-[#202124] hover:underline"
    >
      Directions
      <ChevronDown
        className={`h-4 w-4 transition ${directionsOpen ? "rotate-180" : ""}`}
        aria-hidden
      />
    </button>
  );
}

export function SatExamHeaderRight() {
  return (
    <div className="flex items-center gap-4 text-[#202124]">
      <button
        type="button"
        className="inline-flex flex-col items-center gap-0.5 text-[10px] font-medium"
        title="Highlights & Notes"
      >
        <Highlighter className="h-5 w-5" aria-hidden />
        Highlights & Notes
      </button>
      <button
        type="button"
        className="inline-flex flex-col items-center gap-0.5 text-[10px] font-medium"
        title="More"
      >
        <MoreVertical className="h-5 w-5" aria-hidden />
        More
      </button>
    </div>
  );
}
