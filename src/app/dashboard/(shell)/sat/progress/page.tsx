import { redirect } from "next/navigation";
import { getSatExamSummaries } from "@/app/dashboard/(shell)/sat/actions";
import { ProgressContent } from "@/components/sat/progress/ProgressContent";
import { getCachedUser } from "@/lib/cached-auth";
import { SAT_PRACTICE_EXAMS } from "@/lib/sat-exams";

/**
 * SAT → Progress.
 *
 * The exam table, accuracy and completed count come from real attempts. The
 * scaled-score trajectory, practice time, readiness breakdown and focus topic
 * have no backing table yet, so they stay demo values (see DEMO in the view)
 * rather than being invented here.
 */
export default async function SatProgressPage() {
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const summaries = await getSatExamSummaries();
  const available = SAT_PRACTICE_EXAMS.filter(
    (exam) => exam.status === "available"
  );

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
      available: exam.status === "available",
      attemptId: summary?.lastAttemptId ?? null,
    };
  });

  const completed = rows.filter((row) => row.score != null);
  const latest = completed
    .slice()
    .sort((a, b) =>
      (b.completedAt ?? "").localeCompare(a.completedAt ?? "")
    )[0];

  return (
    <ProgressContent
      rows={rows}
      completedCount={completed.length}
      availableCount={available.length}
      latestAccuracy={latest?.accuracy ?? null}
    />
  );
}
