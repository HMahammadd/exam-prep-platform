import { ArrowRight, BookOpen, Calculator, Sparkles } from "lucide-react";
import Link from "next/link";
import { SAT_LESSONS } from "@/lib/sat-lessons";

export default function SatLessonsPage() {
  return (
    <div className="flex w-full flex-1 items-center justify-center py-4 sm:py-8">
      <div className="w-full max-w-5xl">
        <header className="mx-auto max-w-2xl text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft">
            <Sparkles className="h-7 w-7 text-accent" aria-hidden />
          </span>
          <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-accent">
            SAT Lessons
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Welcome! What would you like to study?
          </h1>
          <p className="mt-4 text-base leading-7 text-muted">
            Choose a subject to begin building your SAT skills with clear,
            focused lessons and guided practice.
          </p>
        </header>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Link
            href={`/dashboard/sat/lessons/${SAT_LESSONS[0].slug}`}
            className="group relative overflow-hidden rounded-2xl border border-blue-300 bg-card p-6 shadow-card transition hover:-translate-y-1 hover:border-accent hover:shadow-[0_16px_40px_-16px_rgba(37,99,235,0.4)] sm:p-8 dark:border-blue-800"
          >
            <div
              className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-400/15 blur-3xl"
              aria-hidden
            />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft">
                  <BookOpen className="h-6 w-6 text-accent" aria-hidden />
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Available now
                </span>
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-foreground">
                Reading &amp; Writing
              </h2>
              <p className="mt-1 text-sm font-medium text-accent">
                SAT Verbal
              </p>
              <p className="mt-4 leading-7 text-muted">
                Strengthen vocabulary, comprehension, evidence analysis,
                grammar, and rhetorical skills across 10 focused lessons.
              </p>
              <span className="mt-7 flex items-center gap-2 font-semibold text-accent">
                Start learning
                <ArrowRight
                  className="h-5 w-5 transition group-hover:translate-x-1"
                  aria-hidden
                />
              </span>
            </div>
          </Link>

          <div
            className="relative overflow-hidden rounded-2xl border border-card-border bg-card/70 p-6 shadow-card sm:p-8"
            aria-disabled="true"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-background">
                <Calculator className="h-6 w-6 text-muted" aria-hidden />
              </span>
              <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted">
                Coming soon
              </span>
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-foreground">Math</h2>
            <p className="mt-1 text-sm font-medium text-muted">SAT Math</p>
            <p className="mt-4 leading-7 text-muted">
              Guided lessons for algebra, advanced math, problem-solving,
              geometry, and trigonometry are on the way.
            </p>
            <span className="mt-7 block font-semibold text-muted">
              Lessons in development
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
