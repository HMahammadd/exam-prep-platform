import { redirect } from "next/navigation";
import { BetaWelcomeBanner } from "@/components/BetaWelcomeBanner";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ExamTrackCard } from "@/components/ExamTrackCard";
import { EXAMS } from "@/lib/exams";
import { getCachedUser } from "@/lib/cached-auth";

/**
 * Exam selection — the step before the dashboard itself.
 *
 * Deliberately outside the (shell) route group: the shell mounts the SAT rail,
 * which is the wrong context for choosing an exam. This page carries the
 * lighter DashboardHeader instead, and picking a track is what enters the
 * shell. Nothing here redirects onward, so /dashboard is a real destination
 * for direct links and for Back from any section.
 */
export default async function ExamSelectionPage() {
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <DashboardHeader title="Dashboard" />

      <main className="exam-select">
        {/* Renders nothing once dismissed, so it sits in the flow gap rather
            than a wrapper that would leave a hole behind. */}
        <BetaWelcomeBanner />

        <h1 className="exam-select-title">Choose your exam</h1>

        <div className="track-grid">
          {EXAMS.map((exam) => (
            <ExamTrackCard key={exam.id} exam={exam} />
          ))}
        </div>
      </main>
    </div>
  );
}
