"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Loader2,
  RotateCcw,
  Send,
} from "lucide-react";
import { gradeDimTest } from "@/app/dashboard/dim/actions";
import type {
  DimChoiceLabel,
  DimMathClientQuestion,
  DimMathGradeResponse,
} from "@/types/dim-math";
import { DimMathContent } from "./DimMathContent";
import { DimMathDiagram } from "./DimMathDiagram";
import {
  DimMathQuestionNavigator,
  type QuestionNavItem,
} from "./DimMathQuestionNavigator";
import { DimMathQuestionStem } from "./DimMathQuestionStem";

type DimMathTestSessionProps = {
  chapterId: number;
  chapterTitle: string;
  testName: string;
  questions: DimMathClientQuestion[];
  backHref: string;
};

type Phase = "practice" | "results";

function createQuestionMap<T>(questions: DimMathClientQuestion[], value: T) {
  return Object.fromEntries(questions.map((q) => [q.id, value])) as Record<
    string,
    T
  >;
}

function isQuestionAnswered(answer: string | null | undefined) {
  return answer != null && answer.trim() !== "";
}

export function DimMathTestSession({
  chapterId,
  chapterTitle,
  testName,
  questions,
  backHref,
}: DimMathTestSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>(() =>
    createQuestionMap(questions, null)
  );
  const [crossedOut, setCrossedOut] = useState<
    Record<string, DimChoiceLabel[]>
  >(() => createQuestionMap(questions, []));
  const [markedForReview, setMarkedForReview] = useState<
    Record<string, boolean>
  >(() => createQuestionMap(questions, false));
  const [navigatorOpen, setNavigatorOpen] = useState(
    () => questions.length <= 20
  );
  const [phase, setPhase] = useState<Phase>("practice");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [gradeResult, setGradeResult] = useState<DimMathGradeResponse | null>(
    null
  );

  const currentQuestion = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  const navigatorItems = useMemo<QuestionNavItem[]>(
    () =>
      questions.map((question, index) => ({
        index,
        number: question.questionNumber,
        isAnswered: isQuestionAnswered(answers[question.id]),
        isMarked: markedForReview[question.id] ?? false,
        isActive: index === currentIndex,
      })),
    [questions, answers, markedForReview, currentIndex]
  );

  const goToQuestion = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const toggleNavigator = useCallback(() => {
    setNavigatorOpen((open) => !open);
  }, []);

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await gradeDimTest(chapterId, answers);
      setGradeResult(result);
      setPhase("results");
      setShowConfirm(false);
    } catch {
      setSubmitError("Nəticə hesablanmadı. Yenidən cəhd edin.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRestart() {
    setCurrentIndex(0);
    setAnswers(createQuestionMap(questions, null));
    setCrossedOut(createQuestionMap(questions, []));
    setMarkedForReview(createQuestionMap(questions, false));
    setNavigatorOpen(questions.length <= 20);
    setGradeResult(null);
    setSubmitError(null);
    setPhase("practice");
  }

  function toggleCrossOut(questionId: string, label: DimChoiceLabel) {
    setCrossedOut((prev) => {
      const current = new Set(prev[questionId] ?? []);
      if (current.has(label)) {
        current.delete(label);
      } else {
        current.add(label);
      }
      return { ...prev, [questionId]: [...current] };
    });

    setAnswers((prev) =>
      prev[questionId] === label ? { ...prev, [questionId]: null } : prev
    );
  }

  function toggleMarkedForReview(questionId: string) {
    setMarkedForReview((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  }

  function isChoiceCrossed(questionId: string, label: DimChoiceLabel) {
    return (crossedOut[questionId] ?? []).includes(label);
  }

  if (phase === "results" && gradeResult) {
    const resultsById = new Map(
      gradeResult.results.map((item) => [item.questionId, item])
    );
    const score = gradeResult.score;
    const review = questions.map((question) => {
      const selected = answers[question.id];
      const graded = resultsById.get(question.id);
      return {
        question,
        selected,
        isCorrect: graded?.isCorrect ?? false,
        correctAnswer: graded?.correctAnswer ?? "",
      };
    });

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-card-border bg-card p-6 shadow-card">
          <h3 className="text-lg font-semibold text-foreground">Nəticə</h3>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {score}/{questions.length}
          </p>
          <p className="mt-1 text-sm text-muted">
            {Math.round((score / questions.length) * 100)}% düzgün
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleRestart}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Yenidən
            </button>
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 rounded-lg border border-card-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent-soft"
            >
              Fəsilərə qayıt
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          {review.map(({ question, selected, isCorrect, correctAnswer }) => (
            <div
              key={question.id}
              className={`rounded-xl border p-4 ${
                isCorrect
                  ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"
                  : "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
              }`}
            >
              <p className="text-sm font-medium text-foreground">
                {question.questionNumber}. {isCorrect ? "Düzgün" : "Səhv"}
              </p>
              {question.diagramId && (
                <DimMathDiagram diagramId={question.diagramId} />
              )}
              <DimMathContent
                text={question.questionText}
                className="mt-2 text-sm text-muted"
              />
              <p className="mt-2 text-sm text-foreground">
                Sizin cavabınız:{" "}
                <span className="font-semibold">{selected ?? "—"}</span>
              </p>
              {!isCorrect && (
                <p className="mt-1 text-sm text-foreground">
                  Düzgün cavab:{" "}
                  <span className="font-semibold">{correctAnswer}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const selectedAnswer = answers[currentQuestion.id];
  const isOpenQuestion = currentQuestion.questionType === "open";
  const isCurrentMarked = markedForReview[currentQuestion.id] ?? false;

  return (
    <div className="flex min-h-[calc(100dvh-14rem)] flex-col">
      <div className="flex-1 space-y-4 pb-4">
        <div className="flex items-center justify-between text-sm text-muted">
          <span className="font-medium text-foreground">
            {chapterTitle} — {testName}
          </span>
          <span>
            Sual {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-card-border">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        <DimMathQuestionNavigator
          items={navigatorItems}
          isOpen={navigatorOpen}
          onToggleOpen={toggleNavigator}
          onSelect={goToQuestion}
        />

        <div className="rounded-2xl border border-card-border bg-card p-5 shadow-card sm:p-6">
          <div className="mb-3 flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-accent">
              Sual {currentQuestion.questionNumber}
            </p>
            <button
              type="button"
              onClick={() => toggleMarkedForReview(currentQuestion.id)}
              aria-pressed={isCurrentMarked}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                isCurrentMarked
                  ? "border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                  : "border-card-border bg-background text-muted hover:border-amber-400/60 hover:text-foreground"
              }`}
            >
              <Flag
                className={`h-4 w-4 ${isCurrentMarked ? "fill-amber-500 text-amber-500" : ""}`}
                aria-hidden
              />
              {isCurrentMarked ? "İşarələnib" : "İşarələ"}
            </button>
          </div>

          <DimMathQuestionStem question={currentQuestion} />

          {isOpenQuestion ? (
            <div className="mt-5">
              <label
                htmlFor={`open-${currentQuestion.id}`}
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Cavabınızı yazın
              </label>
              <input
                id={`open-${currentQuestion.id}`}
                type="text"
                value={selectedAnswer ?? ""}
                onChange={(event) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentQuestion.id]: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-card-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                placeholder="Cavab"
              />
            </div>
          ) : (
            <div className="mt-5 space-y-2">
              {currentQuestion.choices?.map((choice) => {
                const isSelected = selectedAnswer === choice.label;
                const isCrossed = isChoiceCrossed(
                  currentQuestion.id,
                  choice.label
                );

                return (
                  <div
                    key={choice.label}
                    className="flex items-stretch gap-2"
                  >
                    <button
                      type="button"
                      disabled={isCrossed}
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [currentQuestion.id]: choice.label,
                        }))
                      }
                      className={`flex min-h-11 flex-1 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition sm:px-4 sm:py-3 ${
                        isCrossed
                          ? "cursor-not-allowed border-card-border/60 bg-background/50 opacity-45"
                          : isSelected
                            ? "border-accent bg-accent-soft"
                            : "border-card-border bg-background hover:border-accent/50"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-card text-sm font-bold text-foreground ${
                          isCrossed ? "line-through" : ""
                        }`}
                      >
                        {choice.label}
                      </span>
                      <DimMathContent
                        text={choice.text}
                        inline
                        className={`min-w-0 flex-1 text-foreground ${
                          isCrossed ? "line-through" : ""
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleCrossOut(currentQuestion.id, choice.label)
                      }
                      aria-label={
                        isCrossed
                          ? `${choice.label} variantının silinməsini ləğv et`
                          : `${choice.label} variantını sil`
                      }
                      aria-pressed={isCrossed}
                      title={
                        isCrossed ? "Silinməni ləğv et" : "Variantı sil"
                      }
                      className={`flex w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold transition sm:w-11 ${
                        isCrossed
                          ? "border-muted bg-muted/10 text-muted line-through"
                          : "border-card-border bg-card text-muted hover:border-muted hover:bg-muted/10"
                      }`}
                    >
                      {choice.label}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 -mx-6 border-t border-card-border bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => setCurrentIndex((i) => i - 1)}
            className="inline-flex min-w-[108px] items-center justify-center gap-1.5 rounded-lg border border-card-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent-soft disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Geri
          </button>

          <button
            type="button"
            onClick={() =>
              isLast ? setShowConfirm(true) : setCurrentIndex((i) => i + 1)
            }
            className="inline-flex min-w-[132px] items-center justify-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            {isLast ? (
              <>
                <Send className="h-4 w-4" aria-hidden />
                Təhvil ver
              </>
            ) : (
              <>
                İrəli
                <ChevronRight className="h-4 w-4" aria-hidden />
              </>
            )}
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-card-border bg-card p-6 shadow-card">
            <h3 className="text-lg font-semibold text-foreground">
              Testi təhvil vermək istəyirsiniz?
            </h3>
            <p className="mt-2 text-sm text-muted">
              Cavablarınızı yoxladıqdan sonra nəticəni görə bilərsiniz.
            </p>
            {submitError && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                {submitError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirm(false)}
                className="rounded-lg border border-card-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent-soft disabled:opacity-50"
              >
                Ləğv et
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void handleSubmit()}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
              >
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                )}
                Təhvil ver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
