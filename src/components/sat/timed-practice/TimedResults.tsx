import { ArrowLeft, ArrowRight } from "lucide-react";
import { LocaleLink } from "@/components/LocaleLink";
import { SatExamAnswerReview } from "@/components/sat/SatExamAnswerReview";
import type { Locale } from "@/lib/i18n/config";
import { getMessages, translate } from "@/lib/i18n/dictionary";
import { TIMED_PRACTICE_PATH, formatClock } from "@/lib/timed-practice";
import type { TimedResultsData } from "@/types/timed-practice";

/** The session just submitted, reviewed with the same component as a practice exam. */
export function TimedResults({ results, locale }: { results: TimedResultsData; locale: Locale }) {
  const messages = getMessages(locale);
  const t = (key: string, vars?: Record<string, string | number>) =>
    translate(messages, `timedPractice.${key}`, vars);

  // The review groups questions by module; a timed session is one block, in session order.
  const questions = results.questions.map((question) => ({ ...question, module: 1 as const }));

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LocaleLink
          href={TIMED_PRACTICE_PATH}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("results.back")}
        </LocaleLink>
        <LocaleLink
          href={TIMED_PRACTICE_PATH}
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
        >
          {t("results.again")}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </LocaleLink>
      </div>

      <SatExamAnswerReview
        answers={results.answers}
        examName={t("results.examName", { date: results.dateLabel })}
        note={t("results.summary", { minutes: results.minutes, used: formatClock(results.usedSeconds) })}
        questions={questions}
        score={results.correct}
        totalQuestions={results.total}
      />
    </div>
  );
}
