"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { syncMissionTimezone } from "@/app/dashboard/(shell)/sat/daily-mission-actions";
import { AdjustGoalDialog } from "@/components/sat/daily-goal/AdjustGoalDialog";
import { MissionTaskList } from "@/components/sat/daily-goal/MissionTaskList";
import { OrbitPlan } from "@/components/sat/daily-goal/OrbitPlan";
import { WeeklyProgress } from "@/components/sat/daily-goal/WeeklyProgress";
import type { DailyMissionView, MissionTaskId } from "@/types/daily-mission";

/** The mission date is a plain YYYY-MM-DD in the student's zone; read it as UTC so it never shifts. */
function missionDay(date: string) {
  const day = new Date(`${date}T00:00:00Z`);
  const format = (options: Intl.DateTimeFormatOptions) =>
    day.toLocaleDateString("en-GB", { timeZone: "UTC", ...options });
  return {
    long: `${format({ weekday: "long" })} · ${format({ day: "numeric", month: "long" })}`,
    short: `${format({ weekday: "short" })} ${format({ day: "numeric" })}`,
  };
}

function headlineTail(progress: number) {
  if (progress >= 100) return "complete.";
  if (progress >= 75) return "nearly closed.";
  if (progress >= 45) return "halfway round.";
  if (progress > 0) return "under way.";
  return "ready to begin.";
}

function Countdown({ days }: { days: number | null }) {
  if (days === null) {
    return <span className="op-countdown-lbl">SAT date<br />not set</span>;
  }
  if (days < 0) {
    return <span className="op-countdown-lbl">SAT date<br />has passed</span>;
  }
  if (days === 0) {
    return <span className="op-countdown-lbl">Your SAT<br />is today</span>;
  }
  return (
    <>
      <span className="op-countdown-num">{days}</span>
      <span className="op-countdown-lbl">
        {days === 1 ? "day" : "days"} until
        <br />
        your SAT
      </span>
    </>
  );
}

export function DailyGoalContent({ mission }: { mission: DailyMissionView }) {
  const router = useRouter();
  const [adjusting, setAdjusting] = useState(false);
  const [active, setActive] = useState<MissionTaskId | null>(null);
  const syncedRef = useRef(false);

  // "Today" is the student's own calendar day. The browser is the only thing
  // that knows their time zone, so it reports it once; the server re-plans.
  useEffect(() => {
    if (syncedRef.current) return;
    syncedRef.current = true;
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!zone || zone === mission.timezone) return;
    void syncMissionTimezone(zone).then((result) => {
      if (result.success) router.refresh();
    });
  }, [mission.timezone, router]);

  const day = missionDay(mission.date);
  const done = mission.tasks.every((task) => task.status === "completed");

  return (
    <div className="orbit-page">
      <div className="op-wrap">
        <header className="op-head">
          <div className="op-head-text">
            <p className="op-date">{day.long}</p>
            <h2 className="op-title">
              Today’s orbit, <em>{headlineTail(mission.progress)}</em>
            </h2>
            <p className="op-lede">
              {done
                ? "Every planet made it round the sun. A new orbit opens tomorrow."
                : "Each task is a planet. Answer questions to carry it once around the sun."}
            </p>
          </div>

          <div className="op-countdown">
            <Countdown days={mission.examDaysRemaining} />
            <button type="button" className="op-btn-ghost" onClick={() => setAdjusting(true)}>
              Adjust goal
            </button>
          </div>
        </header>

        <section className="op-hero">
          <div className="op-sky">
            <div className="op-sky-bar">
              <span>Orbit plan · {day.short}</span>
              <span>
                Questions <b>{mission.completedItems}</b> / {mission.totalItems}
              </span>
            </div>
            <OrbitPlan
              tasks={mission.tasks}
              progress={mission.progress}
              completed={mission.completedItems}
              total={mission.totalItems}
              active={active}
              onActive={setActive}
            />
            <div className="op-sky-bar">
              <ul className="op-legend" aria-label="Legend">
                <li className="is-completed">Complete</li>
                <li className="is-current">In progress</li>
                <li className="is-upcoming">Up next</li>
              </ul>
              <span>Clockwise from 12</span>
            </div>
          </div>

          <MissionTaskList tasks={mission.tasks} current={mission.current} active={active} onActive={setActive} />
        </section>

        <WeeklyProgress
          days={mission.week}
          streak={mission.streak}
          remainingMinutes={mission.remainingMinutes}
          accuracy={mission.accuracy}
        />
      </div>

      {adjusting ? (
        <AdjustGoalDialog
          onClose={() => setAdjusting(false)}
          onSaved={() => {
            setAdjusting(false);
            router.refresh();
          }}
          today={mission.date}
          examDate={mission.examDate}
          intensity={mission.intensity}
        />
      ) : null}
    </div>
  );
}
