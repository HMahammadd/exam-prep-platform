import { ArrowRight, BookOpen, Clock, ClipboardList } from "lucide-react";
import Link from "next/link";
import type { Exam } from "@/lib/exams";
import { getExamIcon } from "@/lib/exam-icons";
import { getExamTheme } from "@/lib/exam-themes";

type ExamSelectionCardProps = {
  exam: Exam;
  practiceLabel?: string;
};

const EXAM_FOCUS: Record<string, string[]> = {
  sat: ["Guided lessons", "Timed exams", "Answer review"],
  dim: ["Lesson modules", "Buraxılış", "Chapter practice"],
  toefl: ["Skill lessons", "Reading", "Listening"],
};

function ActionButton({
  href,
  available,
  theme,
  icon: Icon,
  label,
  primary,
}: {
  href: string;
  available: boolean;
  theme: ReturnType<typeof getExamTheme>;
  icon: typeof BookOpen;
  label: string;
  primary?: boolean;
}) {
  const className = `inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
    available
      ? primary
        ? theme.btnPrimary
        : theme.btnSecondary
      : theme.btnDisabled
  }`;

  if (!available) {
    return (
      <span className={`${className} cursor-default`}>
        <Clock className="h-4 w-4 shrink-0" aria-hidden />
        {label}
      </span>
    );
  }

  return (
    <Link href={href} className={className}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {label}
      {primary && (
        <ArrowRight
          className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5"
          aria-hidden
        />
      )}
    </Link>
  );
}

export function ExamSelectionCard({
  exam,
  practiceLabel,
}: ExamSelectionCardProps) {
  const practiceAvailable = exam.status === "available";
  const lessonsAvailable = exam.lessonsStatus === "available";
  const trackLive = practiceAvailable || lessonsAvailable;
  const theme = getExamTheme(exam.id);
  const ExamIcon = getExamIcon(exam.id);
  const focus = EXAM_FOCUS[exam.id] ?? [];
  const practiceText =
    practiceLabel ??
    (practiceAvailable ? `Start ${exam.name} Practice` : "Practice — Soon");

  const cardClass = `group relative flex w-full flex-col overflow-hidden rounded-2xl border bg-card p-6 transition duration-300 sm:p-8 ${theme.border} ${theme.shadow} ${theme.borderHover} ${
    trackLive
      ? "hover:-translate-y-0.5"
      : "opacity-95 hover:opacity-100"
  }`;

  return (
    <article className={cardClass}>
      <div
        className={`pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl ${theme.glow}`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full blur-3xl opacity-60 ${theme.glow}`}
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 ${theme.iconWrap}`}
          >
            <ExamIcon className={`h-6 w-6 ${theme.icon}`} aria-hidden />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h3 className="text-xl font-semibold text-foreground sm:text-2xl">
                {exam.name}
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  trackLive ? theme.badgeAvailable : theme.badgeSoon
                }`}
              >
                {trackLive ? "Available" : "Coming Soon"}
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-muted sm:text-sm">
              {trackLive
                ? "Lessons and practice tests"
                : "Lessons and practice — in the works"}
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              {exam.description}
            </p>

            {focus.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {focus.map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-md border px-2.5 py-0.5 text-[11px] font-medium sm:text-xs ${theme.tag}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2.5 sm:flex-row lg:w-auto lg:min-w-[280px] lg:flex-col">
          <ActionButton
            href={exam.lessonsHref}
            available={lessonsAvailable}
            theme={theme}
            icon={BookOpen}
            label={
              lessonsAvailable ? `${exam.name} Lessons` : "Lessons — Soon"
            }
          />
          <ActionButton
            href={exam.dashboardHref}
            available={practiceAvailable}
            theme={theme}
            icon={ClipboardList}
            label={practiceText}
            primary={practiceAvailable}
          />
        </div>
      </div>
    </article>
  );
}
