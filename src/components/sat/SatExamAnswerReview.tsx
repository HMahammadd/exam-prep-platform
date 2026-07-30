import Image from "next/image";
import {
  CheckCircle2,
  CircleDashed,
  XCircle,
} from "lucide-react";
import { getExamQuestions, getQuestionById } from "@/lib/sat-questions";
import { SatChart } from "@/components/sat/SatChart";
import { SatPassage } from "@/components/sat/SatPassage";

export type SatReviewAnswer = {
  id: string;
  question_id: string;
  selected_answer: string | null;
  correct_answer: string;
  is_correct: boolean;
};

type ReviewStatus = "correct" | "wrong" | "missed";

function getStatus(answer: SatReviewAnswer): ReviewStatus {
  if (answer.selected_answer == null || answer.selected_answer === "") {
    return "missed";
  }
  return answer.is_correct ? "correct" : "wrong";
}

const STATUS_STYLES: Record<
  ReviewStatus,
  { badge: string; card: string; label: string; Icon: typeof CheckCircle2 }
> = {
  correct: {
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
    card: "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20",
    label: "Correct",
    Icon: CheckCircle2,
  },
  wrong: {
    badge: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
    card: "border-red-200 bg-red-50/40 dark:border-red-900 dark:bg-red-950/20",
    label: "Wrong",
    Icon: XCircle,
  },
  missed: {
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    card: "border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20",
    label: "Missed",
    Icon: CircleDashed,
  },
};

type SatExamAnswerReviewProps = {
  answers: SatReviewAnswer[];
};

export function SatExamAnswerReview({ answers }: SatExamAnswerReviewProps) {
  const correct = answers.filter((a) => getStatus(a) === "correct");
  const wrong = answers.filter((a) => getStatus(a) === "wrong");
  const missed = answers.filter((a) => getStatus(a) === "missed");

  const sections: { key: ReviewStatus; items: SatReviewAnswer[]; title: string }[] =
    [
      { key: "correct", items: correct, title: "Correct" },
      { key: "wrong", items: wrong, title: "Wrong" },
      { key: "missed", items: missed, title: "Missed (not answered)" },
    ];

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
          <p className="inline-flex items-center gap-1.5 text-sm text-muted">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
            Correct
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {correct.length}
          </p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 dark:border-red-900 dark:bg-red-950/20">
          <p className="inline-flex items-center gap-1.5 text-sm text-muted">
            <XCircle className="h-4 w-4 text-red-600" aria-hidden />
            Wrong
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {wrong.length}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
          <p className="inline-flex items-center gap-1.5 text-sm text-muted">
            <CircleDashed className="h-4 w-4 text-amber-600" aria-hidden />
            Missed
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {missed.length}
          </p>
        </div>
      </div>

      {sections.map(({ key, items, title }) => {
        if (items.length === 0) {
          return null;
        }

        const style = STATUS_STYLES[key];

        return (
          <section key={key}>
            <h3 className="text-lg font-semibold text-foreground">
              {title} ({items.length})
            </h3>
            <div className="mt-4 space-y-4">
              {items.map((answer) => {
                const question = getQuestionById(answer.question_id);
                const globalNumber =
                  answers.findIndex((item) => item.id === answer.id) + 1;
                const moduleQuestionNumber = question
                  ? getExamQuestions(question.examId)
                      .filter((item) => item.module === question.module)
                      .findIndex((item) => item.id === question.id) + 1
                  : globalNumber;
                const StatusIcon = style.Icon;
                const label = question
                  ? `Module ${question.module} · Question ${moduleQuestionNumber}`
                  : `Question ${globalNumber}`;

                return (
                  <div
                    key={answer.id}
                    className={`rounded-xl border p-4 ${style.card}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-foreground">{label}</p>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${style.badge}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" aria-hidden />
                        {style.label}
                      </span>
                    </div>

                    {question && (
                      <>
                        <div className="mt-2">
                          <SatPassage
                            passage={question.passage}
                            variant="review"
                          />
                        </div>
                        {question.chartId && (
                          <SatChart chartId={question.chartId} />
                        )}
                        {question.passageImageUrl && (
                          <div className="relative mt-3 w-full max-w-md overflow-hidden rounded-lg border border-card-border bg-white">
                            <Image
                              src={question.passageImageUrl}
                              alt={`Figure for ${label}`}
                              width={960}
                              height={640}
                              className="h-auto w-full"
                            />
                          </div>
                        )}
                        <p className="mt-3 text-sm font-medium text-foreground">
                          {question.questionText}
                        </p>
                        <div className="mt-2 space-y-1 text-sm">
                          {question.choices.map((choice) => {
                            const isSelected =
                              answer.selected_answer === choice.label;
                            const isCorrectChoice =
                              answer.correct_answer === choice.label;

                            return (
                              <p
                                key={choice.label}
                                className={`${
                                  isCorrectChoice
                                    ? "font-medium text-emerald-700 dark:text-emerald-400"
                                    : isSelected
                                      ? "font-medium text-red-700 dark:text-red-400"
                                      : "text-muted"
                                }`}
                              >
                                {choice.label}) {choice.text}
                                {isCorrectChoice ? " ✓" : ""}
                                {isSelected && !isCorrectChoice
                                  ? " (your answer)"
                                  : ""}
                              </p>
                            );
                          })}
                        </div>
                        <p className="mt-2 text-sm text-foreground">
                          Your answer:{" "}
                          <span className="font-semibold">
                            {answer.selected_answer ?? "— (not answered)"}
                          </span>
                        </p>
                        {key !== "correct" && (
                          <p className="mt-1 text-sm text-foreground">
                            Correct answer:{" "}
                            <span className="font-semibold">
                              {answer.correct_answer}
                            </span>
                          </p>
                        )}
                        <p className="mt-3 rounded-lg bg-card/80 p-3 text-sm leading-relaxed text-muted">
                          {question.explanation}
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
