import { BookOpen } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { DashboardHeader } from "@/components/DashboardHeader";

export default async function SatLessonsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <DashboardHeader title="SAT Lessons" backHref="/dashboard" />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="relative overflow-hidden rounded-2xl border border-blue-200/90 bg-card p-8 shadow-[0_8px_32px_-10px_rgba(37,99,235,0.22)] dark:border-blue-900/80">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-400/20 blur-3xl"
            aria-hidden
          />
          <div className="relative flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60">
              <BookOpen
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                aria-hidden
              />
            </span>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                SAT Lessons
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                Structured lessons to build skills before and between practice
                tests. New modules are on the way — check back soon.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
