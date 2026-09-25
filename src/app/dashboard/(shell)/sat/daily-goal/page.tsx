import { DailyGoalContent } from "@/components/sat/daily-goal/DailyGoalContent";
import { loadLocalMission } from "@/lib/daily-mission-local";

/**
 * SAT → Daily Goal ("Today's orbit"). Runs without a database: the plan and
 * progress live in a cookie — see daily-mission-local.ts.
 */
export default async function SatDailyGoalPage() {
  const mission = await loadLocalMission();
  return <DailyGoalContent mission={mission} />;
}
