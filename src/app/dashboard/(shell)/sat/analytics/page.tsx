import { redirect } from "next/navigation";
import { getSatExamSummaries } from "@/app/dashboard/(shell)/sat/actions";
import { AnalyticsContent } from "@/components/sat/analytics/AnalyticsContent";
import { getCachedUser } from "@/lib/cached-auth";
import { SAT_PRACTICE_EXAMS } from "@/lib/sat-exams";

/**
 * SAT → Analytics.
 *
 * The summary accuracy, best score and the exam comparison table come from
 * real attempts, exactly as on Progress. Per-question timing, per-topic
 * accuracy and mistake counts have no table yet, so they stay demo values
 * (see DEMO in the view) rather than being invented here.
 */
export default async function SatAnalyticsPage() {
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const summaries = await getSatExamSummaries();

  const rows = SAT_PRACTICE_EXAMS.slice(0, 4).map((exam) => {
    const summary = summaries[String(exam.id)];
    const score = summary?.lastScore ?? null;
    const total = summary?.lastTotal ?? null;

    return {
      id: exam.id,
      name: `SAT Practice Test ${String(exam.id).padStart(2, "0")}`,
      completedAt: summary?.lastCompletedAt ?? null,
      score,
      total,
      accuracy:
        score != null && total ? Math.round((score / total) * 100) : null,
    };
  });

  const best = SAT_PRACTICE_EXAMS.reduce<{
    score: number;
    total: number;
    name: string;
  } | null>((found, exam) => {
    const summary = summaries[String(exam.id)];
    if (summary?.bestScore == null || !summary.bestTotal) return found;
    if (found && summary.bestScore <= found.score) return found;
    return {
      score: summary.bestScore,
      total: summary.bestTotal,
      name: `Test ${String(exam.id).padStart(2, "0")}`,
    };
  }, null);

  const latest = rows
    .filter((row) => row.score != null)
    .slice()
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))[0];

  return (
    <AnalyticsContent
      rows={rows}
      bestScore={best?.score ?? null}
      bestTotal={best?.total ?? null}
      bestExamName={best?.name ?? null}
      latestAccuracy={latest?.accuracy ?? null}
    />
  );
}
