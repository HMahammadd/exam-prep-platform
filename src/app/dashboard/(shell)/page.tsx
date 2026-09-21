import { redirect } from "next/navigation";
import { BetaWelcomeBanner } from "@/components/BetaWelcomeBanner";
import { ExamTrackCard } from "@/components/ExamTrackCard";
import { EXAMS } from "@/lib/exams";
import { getCachedUser } from "@/lib/cached-auth";

export default async function DashboardPage() {
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  // Chrome comes from the shell layout; this returns content only.
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6">
        <BetaWelcomeBanner />
      </div>

      <div className="track-grid">
        {EXAMS.map((exam) => (
          <ExamTrackCard key={exam.id} exam={exam} />
        ))}
      </div>
    </div>
  );
}
