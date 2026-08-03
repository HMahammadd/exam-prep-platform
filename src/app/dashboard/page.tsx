import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { getSatExamSummaries } from "@/app/dashboard/sat/actions";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ExamSelectionCard } from "@/components/ExamSelectionCard";
import { EXAMS } from "@/lib/exams";
import { getMyProfile } from "@/lib/services/profile";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-5 shadow-card">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft">
          <Icon className="h-4 w-4 text-accent" aria-hidden />
        </span>
        <p className="text-sm font-medium text-muted">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getMyProfile();
  const displayName = profile?.username || "there";

  const hour = new Date().getHours();
  const greeting = greetingForHour(hour);

  const satSummaries = await getSatExamSummaries();
  const satAttempts = Object.values(satSummaries);
  const satAttemptCount = satAttempts.length;
  const latestSat = satAttempts.reduce<(typeof satAttempts)[number] | null>(
    (latest, summary) => {
      if (!summary.lastCompletedAt) return latest;
      if (!latest?.lastCompletedAt) return summary;
      return summary.lastCompletedAt > latest.lastCompletedAt
        ? summary
        : latest;
    },
    null
  );

  const bestSat =
    satAttempts.find((s) => s.bestScore != null && s.bestTotal != null) ?? null;
  const bestAccuracy =
    bestSat?.bestScore != null && bestSat.bestTotal
      ? Math.round((bestSat.bestScore / bestSat.bestTotal) * 100)
      : null;

  return (
    <div className="flex flex-1 flex-col bg-background">
      <DashboardHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 sm:py-10">
        {/* Compact welcome — atmosphere without crowding navigation */}
        <section className="relative mb-8 overflow-hidden rounded-2xl border border-card-border bg-card px-6 py-6 shadow-card sm:px-8 sm:py-7">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent-soft blur-3xl"
            aria-hidden
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Kepler dashboard
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {greeting}, {displayName}
              </h2>
              <p className="mt-1.5 max-w-lg text-sm text-muted sm:text-base">
                Study with lessons and full practice tests. We&apos;re focused
                on SAT first — pick a track below to get started.
              </p>
            </div>

            {latestSat?.lastScore != null && latestSat.lastTotal != null ? (
              <Link
                href="/dashboard/sat"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
              >
                Continue SAT
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : (
              <Link
                href="/dashboard/sat"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent-soft"
              >
                Start with SAT
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            )}
          </div>
        </section>

        {/* Primary navigation — exams stay the clear center of the page */}
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Your tracks
              </h3>
              <p className="mt-0.5 text-sm text-muted">
                Lessons and practice exams for each exam — SAT is live today.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {EXAMS.map((exam) => (
              <ExamSelectionCard key={exam.id} exam={exam} />
            ))}
          </div>
        </section>

        {/* Slim progress — useful, not a second dashboard */}
        <section className="mt-10">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Your progress
            </h3>
            <p className="mt-0.5 text-sm text-muted">
              A quick look at how your SAT practice is going.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="SAT attempts"
              value={satAttemptCount > 0 ? String(satAttemptCount) : "—"}
              hint={
                satAttemptCount > 0
                  ? "Exams you've completed"
                  : "Finish an exam to start tracking"
              }
              icon={CheckCircle2}
            />
            <StatCard
              label="Best accuracy"
              value={bestAccuracy != null ? `${bestAccuracy}%` : "—"}
              hint={
                bestSat?.bestScore != null && bestSat.bestTotal
                  ? `${bestSat.bestScore}/${bestSat.bestTotal} on your best run`
                  : "Your strongest SAT score"
              }
              icon={BarChart3}
            />
            <StatCard
              label="Last score"
              value={
                latestSat?.lastScore != null && latestSat.lastTotal
                  ? `${latestSat.lastScore}/${latestSat.lastTotal}`
                  : "—"
              }
              hint={
                latestSat?.lastCompletedAt
                  ? `Completed ${new Date(
                      latestSat.lastCompletedAt
                    ).toLocaleDateString()}`
                  : "Most recent SAT result"
              }
              icon={Target}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
