import Link from "next/link";
import { AlertTriangle, ListChecks, Plus } from "lucide-react";
import { createClient } from "@/lib/supabaseServer";
import { EXAM_SECTION_CONFIGS } from "@/lib/question-bank";

type ExamCounts = {
  total: number;
  published: number;
};

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("exam_questions")
    .select("exam_type, status");

  const counts = new Map<string, ExamCounts>();

  for (const row of data ?? []) {
    const current = counts.get(row.exam_type) ?? { total: 0, published: 0 };
    current.total += 1;
    if (row.status === "published") {
      current.published += 1;
    }
    counts.set(row.exam_type, current);
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Question bank
          </h1>
          <p className="mt-2 text-muted">
            Add, edit, and remove questions across every exam section.
          </p>
        </div>
        <Link
          href="/admin/questions/new"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New question
        </Link>
      </div>

      {error && (
        <div className="mb-8 flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">Database setup needed</p>
            <p className="mt-1">
              Run{" "}
              <code className="rounded bg-black/10 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                supabase/migrations/003_admin_question_bank.sql
              </code>{" "}
              in the Supabase SQL Editor to create the question bank tables and
              the image storage bucket.
            </p>
            <p className="mt-1 text-xs opacity-80">{error.message}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {EXAM_SECTION_CONFIGS.map((config) => {
          const stats = counts.get(config.slug) ?? { total: 0, published: 0 };

          return (
            <div
              key={config.slug}
              className="flex flex-col rounded-2xl border border-card-border bg-card p-6 shadow-card"
            >
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-accent" aria-hidden />
                <h2 className="text-lg font-semibold text-foreground">
                  {config.name}
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted">{config.description}</p>

              <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
                {stats.total}
              </p>
              <p className="text-xs text-muted">
                {stats.published} published · {stats.total - stats.published}{" "}
                draft
              </p>

              <div className="mt-5 flex flex-wrap gap-3 text-sm font-medium">
                <Link
                  href={`/admin/questions?exam=${config.slug}`}
                  className="text-accent hover:underline"
                >
                  Manage
                </Link>
                <Link
                  href={`/admin/questions/new?exam=${config.slug}`}
                  className="text-muted hover:text-foreground hover:underline"
                >
                  Add question
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl border border-card-border bg-card p-6 shadow-card">
        <h2 className="text-sm font-medium text-foreground">
          Adding a new exam later
        </h2>
        <p className="mt-2 text-sm text-muted">
          Append an entry to{" "}
          <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">
            EXAM_SECTION_CONFIGS
          </code>{" "}
          in{" "}
          <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">
            src/lib/question-bank.ts
          </code>
          . The admin forms, filters, and this overview pick it up
          automatically — no database change needed.
        </p>
      </div>
    </div>
  );
}
