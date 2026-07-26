import { BookOpen } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SatExamRow } from "@/components/sat/SatExamRow";
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
              Choose a practice exam and start preparing.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {SAT_PRACTICE_EXAMS.map((exam) => (
            <SatExamRow
              key={exam.id}
              exam={exam}
              summary={summaries[String(exam.id)]}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
