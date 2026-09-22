import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCachedUser } from "@/lib/cached-auth";
import { SatMissionControl } from "@/components/sat/mission/SatMissionControl";
import { SAT_PRACTICE_EXAMS } from "@/lib/sat-exams";
import { getSatExamSummaries } from "./actions";

/**
 * SAT Practice Exams.
 *
 * The page is the exam list and nothing else — every card here is an exam.
 * The orbital treatment is setting, not content: the shell's own backdrop
 * supplies the stars and arcs, and the only decoration added per exam is a
 * line mark under 6% opacity.
 */

/**
 * The attempt query is the only part of this page that touches the database.
 * It streams in its own boundary so the page paints immediately and just the
 * scores fill in, instead of the whole journey waiting on it.
 */
async function SatMissionRows() {
  const summaries = await getSatExamSummaries();
  return (
    <SatMissionControl exams={SAT_PRACTICE_EXAMS} serverSummaries={summaries} />
  );
}

/** Orbit beside the heading — the same line language as the shell backdrop. */
function MissionOrbit() {
  return (
    <svg className="sat-mission-orbit" viewBox="0 0 120 120" aria-hidden>
      <circle cx="60" cy="60" r="26" className="sat-mission-orbit-body" />
      <ellipse
        cx="60"
        cy="60"
        rx="56"
        ry="20"
        transform="rotate(-22 60 60)"
        className="sat-mission-orbit-ring"
      />
      <ellipse
        cx="60"
        cy="60"
        rx="44"
        ry="44"
        className="sat-mission-orbit-ring"
      />
      <circle cx="104" cy="38" r="3.5" className="sat-mission-orbit-moon" />
    </svg>
  );
}

export default async function SatDashboardPage() {
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="sat-mission">
      <header className="sat-mission-head">
        <MissionOrbit />

        <div className="sat-mission-head-text">
          <p className="sat-mission-eyebrow">Digital SAT</p>
          <h1 className="sat-mission-title">SAT Practice Exams</h1>
          <p className="sat-mission-tagline">Prepare. Launch. Improve.</p>
          <p className="sat-mission-lede">
            Full-length Digital SAT simulations built for real test conditions.
          </p>
        </div>
      </header>

      <Suspense
        fallback={
          <SatMissionControl
            exams={SAT_PRACTICE_EXAMS}
            serverSummaries={null}
          />
        }
      >
        <SatMissionRows />
      </Suspense>
    </div>
  );
}
