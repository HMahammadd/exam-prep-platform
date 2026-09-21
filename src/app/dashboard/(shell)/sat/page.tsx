import { Suspense } from "react";
import { LocaleLink } from "@/components/LocaleLink";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ClipboardList,
  Flame,
  Star,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";
import { redirect } from "next/navigation";
import { getCachedUser } from "@/lib/cached-auth";
import { SatExamList } from "@/components/sat/SatExamList";
import { SAT_PRACTICE_EXAMS } from "@/lib/sat-exams";
import { getSatExamSummaries } from "./actions";

/**
 * Layout prototype: the exam list below is live, everything in the summary
 * cards is placeholder copy until the progress/analytics tables exist.
 */
/**
 * The attempt query is the only part of this page that touches the database.
 * It streams in its own boundary so the section paints immediately and just
 * the score cells fill in, instead of the whole page waiting on it.
 */
async function SatExamRows() {
  const summaries = await getSatExamSummaries();
  return (
    <SatExamList exams={SAT_PRACTICE_EXAMS} serverSummaries={summaries} />
  );
}

export default async function SatDashboardPage() {
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="sat-grid">
        {/* Continue practice */}
        <section className="sat-card sat-card--wide">
          <div className="sat-card-head">
            <span className="sat-card-icon">
              <ClipboardList className="h-[1.1rem] w-[1.1rem]" aria-hidden />
            </span>
            <div>
              <p className="sat-card-title">Continue practice</p>
              <p className="sat-card-sub">Pick up where you left off</p>
            </div>
          </div>

          <p className="sat-card-body">
            Jump straight back into a full-length exam, or start a fresh set
            under real timing.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <LocaleLink
              href="/dashboard/sat/lessons"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              <BookOpen className="h-4 w-4" aria-hidden />
              SAT Lessons
            </LocaleLink>
            <span className="sat-chip">
              <Timer className="h-3.5 w-3.5" aria-hidden />
              Timed mode
            </span>
          </div>
        </section>

        {/* Today's goal */}
        <section className="sat-card">
          <div className="sat-card-head">
            <span className="sat-card-icon">
              <Target className="h-[1.1rem] w-[1.1rem]" aria-hidden />
            </span>
            <div>
              <p className="sat-card-title">Today&apos;s goal</p>
              <p className="sat-card-sub">Demo target</p>
            </div>
          </div>

          <p className="sat-metric">12 / 20</p>
          <p className="sat-card-sub mb-3">questions answered</p>
          <span className="sat-bar">
            <b style={{ width: "60%" }} />
          </span>
        </section>

        {/* Practice modes */}
        <section className="sat-card sat-card--full">
          <div className="sat-card-head">
            <span className="sat-card-icon">
              <Flame className="h-[1.1rem] w-[1.1rem]" aria-hidden />
            </span>
            <div>
              <p className="sat-card-title">Practice modes</p>
              <p className="sat-card-sub">Choose how you want to work</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Timer, name: "Timed section", hint: "Real exam pacing" },
              { icon: ClipboardList, name: "Untimed set", hint: "Learn first" },
              { icon: Star, name: "Mistakes only", hint: "Fix weak spots" },
              { icon: BookOpen, name: "By topic", hint: "Target one skill" },
            ].map(({ icon: Icon, name, hint }) => (
              <div
                key={name}
                className="rounded-xl border border-card-border bg-background p-3 transition hover:-translate-y-0.5"
              >
                <Icon className="h-4 w-4 text-accent" aria-hidden />
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {name}
                </p>
                <p className="text-xs text-muted">{hint}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Real exam list */}
        <section className="sat-card sat-card--wide">
          <div className="sat-card-head">
            <span className="sat-card-icon">
              <ClipboardList className="h-[1.1rem] w-[1.1rem]" aria-hidden />
            </span>
            <div>
              <p className="sat-card-title">Practice exams</p>
              <p className="sat-card-sub">Full-length, scored on submit</p>
            </div>
          </div>

          <Suspense
            fallback={
              <SatExamList
                exams={SAT_PRACTICE_EXAMS}
                serverSummaries={null}
              />
            }
          >
            <SatExamRows />
          </Suspense>
        </section>

        {/* Statistics */}
        <section className="sat-card">
          <div className="sat-card-head">
            <span className="sat-card-icon">
              <BarChart3 className="h-[1.1rem] w-[1.1rem]" aria-hidden />
            </span>
            <div>
              <p className="sat-card-title">Statistics</p>
              <p className="sat-card-sub">Demo data</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { label: "Accuracy", value: "78%", width: "78%" },
              { label: "Questions", value: "342", width: "52%" },
              { label: "Study time", value: "6h 20m", width: "41%" },
            ].map(({ label, value, width }) => (
              <div key={label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted">{label}</span>
                  <span className="font-semibold text-foreground">{value}</span>
                </div>
                <span className="sat-bar">
                  <b style={{ width }} />
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Weak topics */}
        <section className="sat-card">
          <div className="sat-card-head">
            <span className="sat-card-icon">
              <Star className="h-[1.1rem] w-[1.1rem]" aria-hidden />
            </span>
            <div>
              <p className="sat-card-title">Weak topics</p>
              <p className="sat-card-sub">Demo data</p>
            </div>
          </div>

          <ul className="flex flex-col gap-2">
            {[
              ["Words in Context", "42%"],
              ["Transitions", "61%"],
              ["Command of Evidence", "74%"],
            ].map(([topic, score]) => (
              <li
                key={topic}
                className="flex items-center justify-between rounded-lg border border-card-border px-3 py-2 text-sm"
              >
                <span className="text-foreground">{topic}</span>
                <span className="text-xs font-semibold text-muted">{score}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Recent activity */}
        <section className="sat-card">
          <div className="sat-card-head">
            <span className="sat-card-icon">
              <TrendingUp className="h-[1.1rem] w-[1.1rem]" aria-hidden />
            </span>
            <div>
              <p className="sat-card-title">Recent activity</p>
              <p className="sat-card-sub">Demo data</p>
            </div>
          </div>

          <ul className="flex flex-col gap-2 text-sm">
            {[
              ["Practice Exam 1", "Yesterday"],
              ["Words in Context set", "2 days ago"],
              ["Timed section", "4 days ago"],
            ].map(([item, when]) => (
              <li key={item} className="flex items-center justify-between">
                <span className="text-foreground">{item}</span>
                <span className="text-xs text-muted">{when}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Quick actions */}
        <section className="sat-card">
          <div className="sat-card-head">
            <span className="sat-card-icon">
              <ArrowRight className="h-[1.1rem] w-[1.1rem]" aria-hidden />
            </span>
            <div>
              <p className="sat-card-title">Quick actions</p>
              <p className="sat-card-sub">Shortcuts</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <LocaleLink
              href="/dashboard/sat/lessons"
              className="flex items-center justify-between rounded-lg border border-card-border px-3 py-2 text-sm text-foreground transition hover:border-accent"
            >
              Browse lessons
              <ArrowRight className="h-4 w-4 text-muted" aria-hidden />
            </LocaleLink>
            <LocaleLink
              href="/dashboard"
              className="flex items-center justify-between rounded-lg border border-card-border px-3 py-2 text-sm text-foreground transition hover:border-accent"
            >
              Back to dashboard
              <ArrowRight className="h-4 w-4 text-muted" aria-hidden />
            </LocaleLink>
          </div>
        </section>
    </div>
  );
}
