import { notFound } from "next/navigation";
import { MissionTaskRunner } from "@/components/sat/daily-goal/MissionTaskRunner";
import { isMissionTaskId } from "@/lib/daily-mission";
import { loadLocalRunner } from "@/lib/daily-mission-local";

type MissionTaskPageProps = {
  params: Promise<{ task: string }>;
};

export default async function MissionTaskPage({ params }: MissionTaskPageProps) {
  const { task } = await params;

  if (!isMissionTaskId(task)) {
    notFound();
  }

  const runner = await loadLocalRunner(task);
  return <MissionTaskRunner runner={runner} />;
}
