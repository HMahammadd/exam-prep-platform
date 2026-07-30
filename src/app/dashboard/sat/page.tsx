import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SatExamList } from "@/components/sat/SatExamList";
import { SAT_PRACTICE_EXAMS } from "@/lib/sat-exams";
import { getSatExamSummaries } from "./actions";

export default async function SatDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const summaries = await getSatExamSummaries();

  return (
    <div className="flex flex-1 flex-col bg-background">
      <DashboardHeader title="SAT Practice" backHref="/dashboard" />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="mb-8 flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft">
            <BookOpen className="h-6 w-6 text-accent" aria-hidden />
          </span>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              SAT Practice
            </h2>
            <p className="mt-1 text-sm text-muted">
              Practice exams and lessons — choose a set below or study with
              guided lessons.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <Link
            href="/dashboard/sat/lessons"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-blue-200/90 bg-card p-5 shadow-[0_8px_32px_-10px_rgba(37,99,235,0.18)] transition hover:border-blue-400 hover:shadow-[0_0_0_1px_rgba(59,130,246,0.4),0_12px_40px_-12px_rgba(37,99,235,0.3)] dark:border-blue-900/80"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/60">
                <BookOpen
                  className="h-5 w-5 text-blue-600 dark:text-blue-400"
                  aria-hidden
                />
              </span>
              <div>
                <p className="font-semibold text-foreground">SAT Lessons</p>
                <p className="text-sm text-muted">
                  Build skills with structured lesson modules
                </p>
              </div>
            </div>
            <ArrowRight
              className="h-5 w-5 shrink-0 text-blue-600 transition group-hover:translate-x-0.5 dark:text-blue-400"
              aria-hidden
            />
          </Link>
        </div>

        <SatExamList exams={SAT_PRACTICE_EXAMS} serverSummaries={summaries} />
      </main>
    </div>
  );
}
