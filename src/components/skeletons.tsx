import type { ReactNode } from "react";
import { AuthHeader } from "@/components/AuthHeader";
import { DashboardHeader } from "@/components/DashboardHeader";

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Soft bone matching card borders in light/dark. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cx("animate-pulse rounded-md bg-card-border/70", className)}
      aria-hidden
    />
  );
}

function PageShell({
  title = "Dashboard",
  backHref,
  backLabel = "Dashboard",
  maxWidthClass = "max-w-6xl",
  mainClassName = "px-6 py-10",
  children,
}: {
  title?: string;
  backHref?: string;
  backLabel?: string;
  maxWidthClass?: string;
  mainClassName?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="flex flex-1 flex-col bg-background"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading page"
    >
      <DashboardHeader
        title={title}
        backHref={backHref}
        backLabel={backLabel}
      />
      <main
        className={cx("mx-auto w-full flex-1", maxWidthClass, mainClassName)}
      >
        {children}
        <span className="sr-only">Loading…</span>
      </main>
    </div>
  );
}

function IconTitleBlock({ titleWidth = "w-40" }: { titleWidth?: string }) {
  return (
    <div className="mb-8 flex items-start gap-4">
      <Skeleton className="h-12 w-12 shrink-0 rounded-xl bg-accent-soft" />
      <div className="min-w-0 flex-1 space-y-2 pt-0.5">
        <Skeleton className={cx("h-7", titleWidth)} />
        <Skeleton className="h-4 w-full max-w-sm" />
      </div>
    </div>
  );
}

function SelectionCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-card-border bg-card p-6 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-1.5 h-4 w-4/5 max-w-xs" />
      <Skeleton className="mt-5 h-10 w-full rounded-lg" />
    </div>
  );
}

/* ───────────────────────── Dashboard home ───────────────────────── */

export function DashboardHomeSkeleton() {
  return (
    <PageShell
      title="Dashboard"
      maxWidthClass="max-w-6xl"
      mainClassName="px-6 py-8 sm:py-10"
    >
      <section className="relative mb-8 overflow-hidden rounded-2xl border border-card-border bg-card px-6 py-6 shadow-card sm:px-8 sm:py-7">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent-soft blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-3 w-28 rounded-full bg-accent-soft" />
            <Skeleton className="h-8 w-56 max-w-full sm:h-9 sm:w-72" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </div>
          <Skeleton className="h-10 w-36 shrink-0 rounded-lg" />
        </div>
      </section>

      <section>
        <div className="mb-4 space-y-1">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <div className="flex flex-col gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <article
              key={i}
              className="relative flex w-full flex-col overflow-hidden rounded-2xl border border-card-border bg-card p-6 shadow-card sm:p-8"
            >
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                  <Skeleton className="h-12 w-12 shrink-0 rounded-xl bg-accent-soft" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Skeleton className="h-7 w-20" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-4 w-full max-w-xl" />
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Skeleton className="h-5 w-24 rounded-md" />
                      <Skeleton className="h-5 w-24 rounded-md" />
                      <Skeleton className="h-5 w-28 rounded-md" />
                    </div>
                  </div>
                </div>
                <div className="flex w-full shrink-0 flex-col gap-2.5 sm:flex-row lg:w-auto lg:min-w-[280px] lg:flex-col">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 space-y-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-card-border bg-card p-5 shadow-card"
            >
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg bg-accent-soft" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="mt-3 h-7 w-14" />
              <Skeleton className="mt-2 h-3 w-32" />
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

/* ───────────────────────── SAT ───────────────────────── */

export function SatPracticeSkeleton() {
  return (
    <PageShell
      title="SAT Practice"
      backHref="/dashboard"
      maxWidthClass="max-w-4xl"
    >
      <IconTitleBlock titleWidth="w-36" />

      <div className="mb-6 rounded-2xl border border-blue-200/90 bg-card p-5 shadow-card dark:border-blue-900/80">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950/60" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="hidden h-5 w-5 sm:block" />
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-xl border border-card-border bg-card px-5 py-4 shadow-card sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="hidden h-4 w-20 sm:block" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-24 rounded-lg" />
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export function SatLessonsSkeleton() {
  return (
    <PageShell
      title="SAT Lessons"
      backHref="/dashboard"
      maxWidthClass="max-w-4xl"
    >
      <div className="relative overflow-hidden rounded-2xl border border-blue-200/90 bg-card p-8 shadow-card dark:border-blue-900/80">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-100/80 blur-3xl dark:bg-blue-950/40"
          aria-hidden
        />
        <div className="relative flex items-start gap-4">
          <Skeleton className="h-12 w-12 shrink-0 rounded-xl bg-blue-100 dark:bg-blue-950/60" />
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-full max-w-lg" />
            <Skeleton className="h-4 w-3/4 max-w-md" />
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/** Bluebook instructions screen — no dashboard header. */
export function BluebookInstructionsSkeleton() {
  return (
    <div
      className="flex min-h-screen flex-col bg-[#f8f9fa] text-[#1a2b4c]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading exam"
    >
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-6">
        <Skeleton className="mx-auto mb-8 h-7 w-40 bg-[#e8eaed]" />
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-6 shadow-sm sm:p-8">
          <ul className="space-y-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex gap-4">
                <Skeleton className="h-12 w-12 shrink-0 rounded-full bg-[#e8eaed]" />
                <div className="min-w-0 flex-1 space-y-2 pt-1">
                  <Skeleton className="h-4 w-28 bg-[#e8eaed]" />
                  <Skeleton className="h-3 w-full bg-[#e8eaed]" />
                  <Skeleton className="h-3 w-5/6 max-w-md bg-[#e8eaed]" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <footer className="border-t border-[#e5e7eb] bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl justify-end gap-3">
          <Skeleton className="h-10 w-20 rounded-full bg-[#c5cae0]" />
          <Skeleton className="h-10 w-20 rounded-full bg-[#c5cae0]" />
        </div>
      </footer>
      <span className="sr-only">Loading exam…</span>
    </div>
  );
}

export function SatReviewSkeleton({
  title,
}: {
  title: "Exam Results" | "Exam Details";
}) {
  return (
    <PageShell
      title={title}
      backHref="/dashboard/sat"
      backLabel="SAT Practice"
      maxWidthClass="max-w-7xl"
      mainClassName="px-4 py-8 sm:px-6 sm:py-10"
    >
      {title === "Exam Details" && (
        <div className="mb-4 flex justify-end">
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 rounded-2xl border border-card-border bg-card p-4 shadow-card lg:w-80 xl:w-96">
          <Skeleton className="h-5 w-20" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-9 w-full rounded-lg" />
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-md" />
              ))}
            </div>
            <Skeleton className="mt-2 h-9 w-full rounded-lg" />
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
            <Skeleton className="h-3 w-16" />
            <div className="mt-3 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5 max-w-md" />
            </div>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full rounded-lg" />
            ))}
          </div>
          <div className="rounded-xl border border-card-border bg-card p-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4 max-w-sm" />
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
    </PageShell>
  );
}

/* ───────────────────────── DIM ───────────────────────── */

export function DimHubSkeleton() {
  return (
    <PageShell
      title="DIM Practice"
      backHref="/dashboard"
      maxWidthClass="max-w-4xl"
    >
      <IconTitleBlock titleWidth="w-36" />
      <div className="grid gap-6 sm:grid-cols-2">
        <SelectionCardSkeleton />
        <SelectionCardSkeleton />
      </div>
    </PageShell>
  );
}

export function DimBuraxilisSkeleton() {
  return (
    <PageShell
      title="BURAXILIŞ"
      backHref="/dashboard/dim"
      backLabel="DIM Practice"
      maxWidthClass="max-w-4xl"
    >
      <IconTitleBlock titleWidth="w-32" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <SelectionCardSkeleton />
        <SelectionCardSkeleton />
        <SelectionCardSkeleton />
      </div>
    </PageShell>
  );
}

export function DimMathListSkeleton() {
  return (
    <PageShell
      title="Math"
      backHref="/dashboard/dim/buraxilis"
      backLabel="BURAXILIŞ"
      maxWidthClass="max-w-4xl"
    >
      <IconTitleBlock titleWidth="w-24" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-xl border border-card-border bg-card px-5 py-4 shadow-card sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-lg bg-accent-soft" />
              <Skeleton className="h-4 w-48 max-w-full" />
            </div>
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export function DimMathChapterSkeleton() {
  return (
    <PageShell
      title="Chapter"
      backHref="/dashboard/dim/buraxilis/math"
      backLabel="Math"
      maxWidthClass="max-w-3xl"
      mainClassName="px-6 py-8"
    >
      <div className="mb-6 flex items-start gap-4">
        <Skeleton className="h-12 w-12 shrink-0 rounded-xl bg-accent-soft" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-56 max-w-full" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      <div className="mb-4 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded-md" />
        ))}
      </div>

      <div className="rounded-2xl border border-card-border bg-card p-5 shadow-card sm:p-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-2/3 max-w-xs" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-lg" />
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-between gap-3">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </PageShell>
  );
}

/* ───────────────────────── Coming soon ───────────────────────── */

export function ComingSoonPageSkeleton({
  examName,
  backHref = "/dashboard",
  backLabel = "Dashboard",
}: {
  examName: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div
      className="flex flex-1 flex-col bg-background"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading page"
    >
      <DashboardHeader backHref={backHref} backLabel={backLabel} />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20">
        <Skeleton className="h-16 w-16 rounded-full bg-accent-soft" />
        <Skeleton className="h-10 w-72 max-w-full sm:h-12 sm:w-96" />
        <Skeleton className="h-4 w-64 max-w-full" />
        <span className="sr-only">Loading {examName}…</span>
      </main>
    </div>
  );
}

/* ───────────────────────── Inbox / Friends ───────────────────────── */

export function InboxSkeleton() {
  return (
    <PageShell
      title="Inbox"
      backHref="/dashboard"
      maxWidthClass="max-w-6xl"
      mainClassName="flex flex-col px-4 py-6 sm:px-6"
    >
      <div className="flex min-h-[28rem] flex-1 flex-col overflow-hidden rounded-2xl border border-card-border bg-card shadow-card md:min-h-[32rem] md:flex-row">
        <aside className="flex w-full flex-col border-b border-card-border md:w-[38%] md:border-b-0 md:border-r">
          <div className="border-b border-card-border px-3 py-3">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="flex-1 space-y-1 p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg px-2 py-2.5">
                <Skeleton className="h-2 w-2 shrink-0 rounded-full" />
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </aside>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
          <Skeleton className="h-12 w-12 rounded-full bg-accent-soft" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
      </div>
    </PageShell>
  );
}

export function FriendsSkeleton() {
  return (
    <PageShell
      title="Friends"
      backHref="/dashboard"
      maxWidthClass="max-w-2xl"
      mainClassName="px-6 py-8"
    >
      <div className="mb-6 rounded-xl border border-card-border bg-card p-1.5 shadow-card">
        <div className="grid grid-cols-2 gap-1.5">
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </div>

      <Skeleton className="mb-4 h-10 w-full rounded-lg" />

      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 rounded-xl border border-card-border bg-card px-4 py-3 shadow-card"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        ))}
      </div>
    </PageShell>
  );
}

/* ───────────────────────── Profile / Settings ───────────────────────── */

export function ProfileSkeleton() {
  return (
    <PageShell
      title="Profile"
      backHref="/dashboard"
      maxWidthClass="max-w-2xl"
      mainClassName="px-6 py-8"
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-card-border bg-card p-6 shadow-card">
          <Skeleton className="mb-4 h-5 w-36" />
          <div className="mb-4 flex justify-center">
            <Skeleton className="h-20 w-20 rounded-full ring-4 ring-accent-soft" />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-xl" />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-card-border bg-card p-6 shadow-card">
          <Skeleton className="mb-4 h-5 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="mt-2 h-3 w-56" />
        </div>

        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </PageShell>
  );
}

export function SettingsSkeleton() {
  return (
    <PageShell
      title="Settings"
      backHref="/dashboard"
      maxWidthClass="max-w-2xl"
      mainClassName="px-6 py-8"
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-card-border bg-card p-6 shadow-card">
          <Skeleton className="mb-4 h-5 w-28" />
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>

        <div className="rounded-2xl border border-card-border bg-card p-6 shadow-card">
          <Skeleton className="mb-4 h-5 w-24" />
          <Skeleton className="mb-1.5 h-3.5 w-28" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="mt-1 h-3 w-48" />
        </div>

        <div className="rounded-2xl border border-card-border bg-card p-6 shadow-card">
          <Skeleton className="mb-4 h-5 w-24" />
          <Skeleton className="mb-4 h-4 w-full max-w-sm" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>
    </PageShell>
  );
}

/* ───────────────────────── Practice ───────────────────────── */

export function PracticePageSkeleton() {
  return (
    <PageShell
      title="SAT Practice"
      backHref="/dashboard"
      maxWidthClass="max-w-3xl"
    >
      <div className="rounded-2xl border border-card-border bg-card p-8 shadow-card">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-2 h-4 w-56" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        <Skeleton className="mt-6 h-10 w-36 rounded-lg" />
      </div>
    </PageShell>
  );
}

/* ───────────────────────── Admin ───────────────────────── */

export function AdminOverviewSkeleton() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" aria-label="Loading">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-card-border bg-card p-6 shadow-card"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="mt-4 h-9 w-14" />
            <Skeleton className="mt-2 h-3 w-28" />
            <div className="mt-5 flex gap-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-card-border bg-card p-6 shadow-card">
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function AdminQuestionsSkeleton() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" aria-label="Loading">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card p-5 shadow-card sm:flex-row"
          >
            <Skeleton className="h-[4.5rem] w-full shrink-0 rounded-lg sm:w-24" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="flex gap-2 sm:flex-col">
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function AdminQuestionFormSkeleton() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" aria-label="Loading">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>

      <div className="rounded-2xl border border-card-border bg-card p-8 shadow-card">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-28 w-full rounded-lg" />
        </div>

        <div className="mt-8 space-y-3">
          <Skeleton className="h-3.5 w-20" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function AdminInboxSkeleton() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" aria-label="Loading">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      <div className="flex min-h-[28rem] flex-col overflow-hidden rounded-2xl border border-card-border bg-card shadow-card md:min-h-[32rem] md:flex-row">
        <aside className="flex w-full flex-col border-b border-card-border md:w-[38%] md:border-b-0 md:border-r">
          <div className="flex-1 space-y-1 p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg px-2 py-2.5">
                <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-accent-soft" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </aside>
        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="mt-auto h-10 w-28 self-end rounded-full" />
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/* ───────────────────────── Onboarding ───────────────────────── */

export function OnboardingSkeleton() {
  return (
    <div
      className="flex min-h-full flex-1 flex-col bg-background"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <AuthHeader />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-card-border bg-card p-8 shadow-card">
          <div className="mb-8 space-y-2 text-center">
            <Skeleton className="mx-auto h-12 w-12 rounded-full bg-accent-soft" />
            <Skeleton className="mx-auto h-7 w-48" />
            <Skeleton className="mx-auto h-4 w-56 max-w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <Skeleton className="mt-5 h-10 w-full rounded-lg" />
          <Skeleton className="mx-auto mt-4 h-4 w-16" />
        </div>
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}
