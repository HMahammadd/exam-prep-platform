"use client";

import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";
import { LocaleLink } from "@/components/LocaleLink";
import { usePathname } from "next/navigation";
import { SAT_LESSONS } from "@/lib/sat-lessons";

export function SatLessonNavigation() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-card-border bg-card md:w-72 md:shrink-0 md:border-r md:border-b-0">
      <div className="border-b border-card-border px-5 py-5">
        <LocaleLink
          href="/dashboard/sat/lessons"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          All SAT subjects
        </LocaleLink>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft">
            <BookOpen className="h-5 w-5 text-accent" aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-foreground">Reading &amp; Writing</p>
            <p className="text-xs text-muted">10 SAT lessons</p>
          </div>
        </div>
      </div>

      <nav aria-label="SAT lessons" className="p-2">
        <ol className="grid gap-1 sm:grid-cols-2 md:grid-cols-1">
          {SAT_LESSONS.map((lesson, index) => {
            const href = `/dashboard/sat/lessons/${lesson.slug}`;
            const isCurrent = pathname === href;

            return (
              <li key={lesson.slug}>
                <LocaleLink
                  href={href}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`group flex min-h-14 items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                    isCurrent
                      ? "bg-accent-soft text-foreground"
                      : "text-muted hover:bg-background hover:text-foreground"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                      isCurrent
                        ? "bg-accent text-white"
                        : "bg-background text-muted group-hover:text-foreground"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium leading-snug">
                    {lesson.title}
                  </span>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 ${
                      isCurrent
                        ? "text-accent"
                        : "text-card-border group-hover:text-muted"
                    }`}
                    aria-hidden
                  />
                </LocaleLink>
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}
