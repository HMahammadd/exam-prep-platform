import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import type { Exam } from "@/lib/exams";
import { getExamIcon } from "@/lib/exam-icons";

type ExamSelectionCardProps = {
  exam: Exam;
  actionLabel?: string;
};

const EXAM_FOCUS: Record<string, string[]> = {
  sat: ["Timed exams", "Answer review"],
  dim: ["Buraxılış", "Chapter practice"],
  toefl: ["Reading", "Listening"],
};

export function ExamSelectionCard({
  exam,
  actionLabel,
}: ExamSelectionCardProps) {
  const isAvailable = exam.status === "available";
  const ExamIcon = getExamIcon(exam.id);
  const focus = EXAM_FOCUS[exam.id] ?? [];
  const label =
    actionLabel ??
    (isAvailable ? `Start ${exam.name} Practice` : "Coming Soon");

  const cardContent = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft transition group-hover:scale-105">
            <ExamIcon className="h-5 w-5 text-accent" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-foreground">
              {exam.name}
            </h3>
            <p className="mt-0.5 text-xs font-medium text-muted">
              {isAvailable ? "Ready to practice" : "In the works"}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isAvailable
              ? "bg-accent-soft text-accent"
              : "bg-card-border text-muted"
          }`}
        >
          {isAvailable ? "Available" : "Coming Soon"}
        </span>
      </div>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
        {exam.description}
      </p>

      {focus.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {focus.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-card-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <span
        className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
          isAvailable
            ? "bg-accent text-white group-hover:bg-accent-hover"
            : "border border-card-border bg-background text-muted"
        }`}
      >
        {!isAvailable && <Clock className="h-4 w-4" aria-hidden />}
        {label}
        {isAvailable && (
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
        )}
      </span>
    </>
  );

  if (!isAvailable) {
    return (
      <Link
        href={exam.dashboardHref}
        className="group flex flex-col rounded-2xl border border-card-border bg-card p-6 opacity-80 shadow-card transition hover:opacity-100"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <Link
      href={exam.dashboardHref}
      className="group flex flex-col rounded-2xl border border-card-border bg-card p-6 shadow-card transition hover:-translate-y-0.5 hover:border-accent hover:shadow-lg"
    >
      {cardContent}
    </Link>
  );
}
