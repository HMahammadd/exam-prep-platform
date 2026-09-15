"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  ImageIcon,
  LoaderCircle,
  Pencil,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  loadQuestionPage,
  type QuestionListFilters,
} from "@/app/admin/questions/actions";
import { DeleteQuestionButton } from "@/components/admin/DeleteQuestionButton";
import {
  QuestionVisual,
  hasQuestionVisual,
} from "@/components/sat/QuestionVisual";
import { getExamName } from "@/lib/question-bank";
import type {
  QuestionBankDifficulty,
  QuestionBankItem,
} from "@/types/question-bank";

function readDifficulty(
  value: string | null
): QuestionBankDifficulty | undefined {
  return value === "easy" || value === "medium" || value === "hard"
    ? value
    : undefined;
}

export function QuestionResults() {
  const searchParams = useSearchParams();
  const exam = searchParams.get("exam") ?? "";
  const section = searchParams.get("section") ?? undefined;
  const skill = searchParams.get("skill") ?? undefined;
  const difficulty = readDifficulty(searchParams.get("difficulty"));
  const search = searchParams.get("q") ?? undefined;
  const filters = useMemo<QuestionListFilters>(
    () => ({ exam, section, skill, difficulty, search }),
    [difficulty, exam, search, section, skill]
  );
  const filterKey = `${exam}|${section ?? ""}|${skill ?? ""}|${
    difficulty ?? ""
  }|${search ?? ""}`;

  if (!exam) {
    return (
      <section className="flex min-h-96 items-center justify-center rounded-2xl border border-dashed border-card-border bg-card/50 p-8 text-center">
        <div className="max-w-sm">
          <h2 className="font-semibold text-foreground">
            Select an exam to begin
          </h2>
          <p className="mt-2 text-sm text-muted">
            Choose SAT, TOEFL, or DIM to load its questions.
          </p>
        </div>
      </section>
    );
  }

  return (
    <QuestionResultsFeed key={filterKey} exam={exam} filters={filters} />
  );
}

function QuestionResultsFeed({
  exam,
  filters,
}: {
  exam: string;
  filters: QuestionListFilters;
}) {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    void loadQuestionPage(filters).then((result) => {
      if (cancelled) {
        return;
      }

      if (result.success) {
        setQuestions(result.questions);
        setTotal(result.total);
        setHasMore(result.hasMore);
      } else {
        setError(result.error);
      }

      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMoreRef.current) {
      return;
    }

    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    const result = await loadQuestionPage(filters, questions.length);

    if (result.success) {
      setQuestions((current) => {
        const existingIds = new Set(current.map((question) => question.id));
        return [
          ...current,
          ...result.questions.filter(
            (question) => !existingIds.has(question.id)
          ),
        ];
      });
      setTotal(result.total);
      setHasMore(result.hasMore);
    } else {
      setError(result.error);
    }

    loadingMoreRef.current = false;
    setIsLoadingMore(false);
  }, [filters, hasMore, questions.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "300px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  if (isLoading) {
    return <QuestionListLoading />;
  }

  if (error && questions.length === 0) {
    return (
      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">Could not load questions</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (questions.length === 0) {
    return (
      <section className="flex min-h-96 items-center justify-center rounded-2xl border border-dashed border-card-border bg-card p-8 text-center">
        <div>
          <h2 className="font-semibold text-foreground">
            No matching questions
          </h2>
          <p className="mt-2 text-sm text-muted">
            Try changing the filters or add a new question.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-label={`${getExamName(exam)} questions`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Showing {questions.length} of {total} questions
        </p>
      </div>

      <ol className="space-y-5">
        {questions.map((question) => (
          <li key={question.id}>
            <QuestionCard
              question={question}
              onDeleted={() => {
                setQuestions((current) =>
                  current.filter((item) => item.id !== question.id)
                );
                setTotal((current) => Math.max(0, current - 1));
              }}
            />
          </li>
        ))}
      </ol>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              void loadMore();
            }}
            className="mt-2 font-semibold underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}

      <div ref={sentinelRef} className="flex min-h-20 items-center justify-center">
        {isLoadingMore && (
          <span className="inline-flex items-center gap-2 text-sm text-muted">
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            Loading more questions…
          </span>
        )}
        {!hasMore && !error && (
          <p className="text-sm text-muted">You reached the end.</p>
        )}
      </div>
    </section>
  );
}

function QuestionCard({
  question,
  onDeleted,
}: {
  question: QuestionBankItem;
  onDeleted: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-card">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-card-border px-5 py-4">
        <div>
          <h2 className="font-semibold text-foreground">
            {question.questionCode ?? `Question #${question.questionNumber}`}
          </h2>
          {question.questionCode && (
            <p className="mt-1 text-xs text-muted">
              Question #{question.questionNumber}
              {question.sourceId ? ` · Source ID ${question.sourceId}` : ""}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <Badge>{getExamName(question.examType)}</Badge>
            {question.section && <Badge>{question.section}</Badge>}
            {question.skill && <Badge>{question.skill}</Badge>}
            <Badge>
              {question.questionType === "multiple-choice"
                ? "Multiple choice"
                : "Open answer"}
            </Badge>
            {question.difficulty && <Badge>{question.difficulty}</Badge>}
            <Badge>{question.status}</Badge>
            <span className="text-muted">
              {question.groupLabel ?? question.groupKey}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Link
            href={`/admin/questions/${question.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-card-border px-3 py-2 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            Edit
          </Link>
          <DeleteQuestionButton
            questionId={question.id}
            questionNumber={question.questionNumber}
            onDeleted={onDeleted}
          />
        </div>
      </header>

      <div className="space-y-5 p-5">
        {question.passage && (
          <div className="rounded-xl border border-card-border bg-background p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Passage
            </p>
            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
              {question.passage}
            </p>
          </div>
        )}

        {question.imageUrl ? (
          <Image
            src={question.imageUrl}
            alt=""
            width={900}
            height={500}
            className="max-h-96 w-auto rounded-xl border border-card-border object-contain"
          />
        ) : (
          hasQuestionVisual(question.questionCode) && (
            <QuestionVisual questionCode={question.questionCode} />
          )
        )}

        <div className="flex gap-3">
          {!question.imageUrl && !hasQuestionVisual(question.questionCode) && (
            <div className="mt-0.5 hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-card-border text-muted sm:flex">
              <ImageIcon className="h-4 w-4" aria-hidden />
            </div>
          )}
          <p className="whitespace-pre-wrap text-base leading-7 text-foreground">
            {question.questionText}
          </p>
        </div>

        {question.questionType === "multiple-choice" ? (
          <div className="space-y-2">
            {question.choices.map((choice) => {
              const isCorrect =
                choice.isCorrect || choice.label === question.correctAnswer;
              return (
                <div
                  key={choice.id ?? choice.label}
                  className={`flex gap-3 rounded-xl border px-4 py-3 text-sm ${
                    isCorrect
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                      : "border-card-border bg-background text-foreground"
                  }`}
                >
                  <span className="font-semibold">{choice.label}</span>
                  <span className="min-w-0 flex-1">{choice.choiceText}</span>
                  {isCorrect && (
                    <Check className="h-4 w-4 shrink-0" aria-label="Correct" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
            <span className="font-semibold">Correct answer: </span>
            {question.correctAnswer}
            {question.acceptedAnswers.length > 0 && (
              <p className="mt-1 text-xs">
                Also accepted: {question.acceptedAnswers.join(", ")}
              </p>
            )}
          </div>
        )}

        {question.explanation && (
          <div className="rounded-xl border border-card-border bg-background p-4">
            <p className="text-sm font-semibold text-foreground">Explanation</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">
              {question.explanation}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-accent/10 px-2 py-0.5 font-medium capitalize text-accent">
      {children}
    </span>
  );
}

function QuestionListLoading() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading questions">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-card-border bg-card p-5 shadow-card"
        >
          <div className="h-5 w-32 rounded bg-card-border/70" />
          <div className="mt-4 h-4 w-full rounded bg-card-border/70" />
          <div className="mt-2 h-4 w-4/5 rounded bg-card-border/70" />
          <div className="mt-6 space-y-2">
            {Array.from({ length: 4 }).map((__, choiceIndex) => (
              <div
                key={choiceIndex}
                className="h-11 rounded-xl bg-card-border/70"
              />
            ))}
          </div>
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
