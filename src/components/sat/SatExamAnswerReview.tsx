"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  XCircle,
} from "lucide-react";
import { SatChart } from "@/components/sat/SatChart";
import { SatPassage } from "@/components/sat/SatPassage";
import { SatReviewQuestionGrid } from "@/components/sat/SatReviewQuestionGrid";
import {
  buildReviewSections,
  findReviewItem,
  flattenReviewItems,
  getDefaultSelectedQuestionId,
  type ReviewQuestionItem,
  type ReviewSectionKey,
  type SatReviewAnswer,
} from "@/lib/sat-review";

export type { SatReviewAnswer };

type SatExamAnswerReviewProps = {
  answers: SatReviewAnswer[];
  examId: number;
  examName: string;
  score: number;
  totalQuestions: number;
  note?: string;
};

function moduleKey(section: ReviewSectionKey, module: number) {
  return `${section}-${module}`;
}

export function SatExamAnswerReview({
  answers,
  examId,
  examName,
  score,
  totalQuestions,
  note,
}: SatExamAnswerReviewProps) {
  const sections = useMemo(
    () => buildReviewSections(answers, examId),
    [answers, examId]
  );

  const flatItems = useMemo(() => flattenReviewItems(sections), [sections]);

  const defaultSelectedId = useMemo(
    () => getDefaultSelectedQuestionId(sections),
    [sections]
  );

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null
  );
  const activeQuestionId = selectedQuestionId ?? defaultSelectedId;
  const [expandedSections, setExpandedSections] = useState<
    Record<ReviewSectionKey, boolean>
  >({ verbal: true, math: false });
  const [expandedModules, setExpandedModules] = useState<
    Record<string, boolean>
  >(() => ({
    [moduleKey("verbal", 1)]: true,
    [moduleKey("verbal", 2)]: false,
    [moduleKey("math", 1)]: false,
    [moduleKey("math", 2)]: false,
  }));

  const selectedItem = activeQuestionId
    ? findReviewItem(sections, activeQuestionId)
    : null;

  const selectedIndex = activeQuestionId
    ? flatItems.findIndex((item) => item.question.id === activeQuestionId)
    : -1;
  const previousItem =
    selectedIndex > 0 ? flatItems[selectedIndex - 1] : null;
  const nextItem =
    selectedIndex >= 0 && selectedIndex < flatItems.length - 1
      ? flatItems[selectedIndex + 1]
      : null;

  const shortExamName = examName.replace(/^SAT Practice\s+/i, "") || examName;

  function toggleSection(key: ReviewSectionKey) {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleModule(section: ReviewSectionKey, module: number) {
    const key = moduleKey(section, module);
    setExpandedModules((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function selectQuestion(
    questionId: string,
    section: ReviewSectionKey,
    module: number
  ) {
    setSelectedQuestionId(questionId);
    setExpandedSections((prev) => ({ ...prev, [section]: true }));
    setExpandedModules((prev) => ({
      ...prev,
      [moduleKey(section, module)]: true,
    }));
  }

  function goToItem(item: ReviewQuestionItem) {
    selectQuestion(item.question.id, item.section, item.moduleNumber);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
            {examName}
          </h2>
          {note ? <p className="mt-1 text-sm text-muted">{note}</p> : null}
        </div>
        <p className="text-sm font-medium text-muted">
          Score{" "}
          <span className="text-lg font-bold text-foreground">
            {score}/{totalQuestions}
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Left: exam navigator */}
        <aside className="w-full shrink-0 lg:w-80 xl:w-96">
          <p className="text-base font-semibold text-foreground">
            {shortExamName}
          </p>

          <div className="mt-3 space-y-1">
            {sections.map((section) => {
              const sectionOpen = expandedSections[section.key];

              return (
                <div key={section.key}>
                  <button
                    type="button"
                    onClick={() => toggleSection(section.key)}
                    className="flex w-full items-center gap-1.5 rounded-md px-1 py-1.5 text-left text-sm font-semibold text-foreground hover:bg-accent-soft"
                    aria-expanded={sectionOpen}
                  >
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted transition-transform ${
                        sectionOpen ? "" : "-rotate-90"
                      }`}
                      aria-hidden
                    />
                    {section.label}
                  </button>

                  {sectionOpen ? (
                    <div className="ml-2 space-y-1 border-l border-card-border pl-3">
                      {section.modules.map((moduleGroup) => {
                        const key = moduleKey(section.key, moduleGroup.module);
                        const moduleOpen = expandedModules[key] ?? false;

                        return (
                          <div key={key}>
                            <button
                              type="button"
                              onClick={() =>
                                toggleModule(section.key, moduleGroup.module)
                              }
                              className="flex w-full items-center justify-between gap-2 rounded-md px-1 py-1.5 text-left text-sm text-foreground hover:bg-accent-soft"
                              aria-expanded={moduleOpen}
                            >
                              <span className="inline-flex items-center gap-1.5 font-medium">
                                <ChevronDown
                                  className={`h-3.5 w-3.5 shrink-0 text-muted transition-transform ${
                                    moduleOpen ? "" : "-rotate-90"
                                  }`}
                                  aria-hidden
                                />
                                Module {moduleGroup.module}
                              </span>
                              <span className="text-xs tabular-nums text-muted">
                                {moduleGroup.correctCount}/{moduleGroup.total}
                              </span>
                            </button>

                            {moduleOpen ? (
                              <div className="mt-2 pb-3">
                                <SatReviewQuestionGrid
                                  items={moduleGroup.items}
                                  selectedQuestionId={activeQuestionId}
                                  onSelect={(questionId) =>
                                    selectQuestion(
                                      questionId,
                                      section.key,
                                      moduleGroup.module
                                    )
                                  }
                                />
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 border-t border-card-border pt-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded border-2 border-emerald-500 bg-emerald-50" />
              Correct
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded border-2 border-red-500 bg-red-50" />
              Wrong
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded border-2 border-amber-400 bg-amber-50" />
              Missed
            </span>
          </div>
        </aside>

        {/* Right: question detail */}
        <section className="min-w-0 flex-1">
          {selectedItem ? (
            <QuestionDetail
              item={selectedItem}
              onPrevious={
                previousItem ? () => goToItem(previousItem) : undefined
              }
              onNext={nextItem ? () => goToItem(nextItem) : undefined}
            />
          ) : (
            <p className="text-sm text-muted">
              Select a question from the navigator to view its explanation.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function QuestionDetail({
  item,
  onPrevious,
  onNext,
}: {
  item: ReviewQuestionItem;
  onPrevious?: () => void;
  onNext?: () => void;
}) {
  const { answer, question, status, questionNumber } = item;

  const statusMeta = {
    correct: {
      label: "Correct",
      className:
        "bg-emerald-500 text-white dark:bg-emerald-600",
      Icon: CheckCircle2,
    },
    wrong: {
      label: "Wrong",
      className: "bg-red-500 text-white dark:bg-red-600",
      Icon: XCircle,
    },
    missed: {
      label: "Missed",
      className: "bg-amber-400 text-amber-950 dark:bg-amber-500 dark:text-white",
      Icon: CircleDashed,
    },
  }[status];

  const StatusIcon = statusMeta.Icon;
  const label = `Module ${question.module} · Question ${questionNumber}`;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-xl font-semibold text-foreground">
            Q {questionNumber}
          </h3>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusMeta.className}`}
          >
            <StatusIcon className="h-3.5 w-3.5" aria-hidden />
            {statusMeta.label}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">{label}</p>
      </div>

      {/* Passage + question + choices */}
      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Passage
        </p>
        <div>
          <SatPassage passage={question.passage} variant="review" />
        </div>

        {question.chartId ? (
          <div className="mt-3">
            <SatChart chartId={question.chartId} />
          </div>
        ) : null}

        {question.passageImageUrl ? (
          <div className="relative mt-3 w-full max-w-md overflow-hidden rounded-lg border border-card-border bg-white">
            <Image
              src={question.passageImageUrl}
              alt={`Figure for ${label}`}
              width={960}
              height={640}
              className="h-auto w-full"
            />
          </div>
        ) : null}

        <p className="mt-4 text-[15px] font-bold leading-7 text-foreground">
          {question.questionText}
        </p>

        <div className="mt-4 space-y-2">
          {question.choices.map((choice) => {
            const isSelected = answer.selected_answer === choice.label;
            const isCorrectChoice = answer.correct_answer === choice.label;

            let choiceClass =
              "border border-card-border bg-white text-foreground dark:bg-card";
            let badge: string | null = null;

            if (isCorrectChoice) {
              choiceClass =
                "border-2 border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200";
              badge = "Correct";
            } else if (isSelected) {
              choiceClass =
                "border-2 border-red-500 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200";
              badge = "Your answer";
            }

            return (
              <div
                key={choice.label}
                className={`flex items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-sm ${choiceClass}`}
              >
                <p className="font-medium leading-6">
                  <span className="mr-1.5 font-bold">{choice.label})</span>
                  {choice.text}
                </p>
                {badge ? (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      isCorrectChoice
                        ? "bg-emerald-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {badge}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <p>
            <span className="text-muted">Your answer: </span>
            <span
              className={`font-bold ${
                status === "correct"
                  ? "text-emerald-600"
                  : status === "wrong"
                    ? "text-red-600"
                    : "text-amber-600"
              }`}
            >
              {answer.selected_answer ?? "— (not answered)"}
            </span>
          </p>
          {status !== "correct" ? (
            <p>
              <span className="text-muted">Correct answer: </span>
              <span className="font-bold text-emerald-600">
                {answer.correct_answer}
              </span>
            </p>
          ) : null}
        </div>
      </section>

      {/* Explanation */}
      <section className="rounded-xl border border-violet-200 bg-violet-50/60 p-4 dark:border-violet-900 dark:bg-violet-950/30">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400">
          Explanation
        </p>
        <p className="text-[15px] leading-7 text-foreground">
          {question.explanation}
        </p>
      </section>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!onPrevious}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#1e3a5f] bg-[#f3f7fb] px-4 py-2 text-sm font-medium text-[#1e3a5f] transition hover:bg-[#e8eef6] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous question"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!onNext}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#1e3a5f] bg-[#f3f7fb] px-4 py-2 text-sm font-medium text-[#1e3a5f] transition hover:bg-[#e8eef6] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next question"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
