import { Flame, Hourglass, Target } from "lucide-react";
import type { WeeklyDay } from "@/types/daily-mission";

const STATUS_WORD: Record<WeeklyDay["status"], string> = {
  completed: "mission completed",
  partial: "mission partly done",
  missed: "no mission completed",
  today: "today",
  upcoming: "upcoming",
};

/** A moon lit from the right: the terminator is a half-ellipse whose width tracks the fraction. */
function Moon({ fraction }: { fraction: number }) {
  const r = 12;
  const c = 14;
  const f = Math.max(0, Math.min(1, fraction));
  const rx = r * Math.abs(1 - 2 * f);
  const sweep = f > 0.5 ? 0 : 1;
  return (
    <svg className="op-moon-svg" viewBox="0 0 28 28" width={28} height={28} aria-hidden>
      <circle cx={c} cy={c} r={r} className="op-moon-edge" />
      {f >= 1 ? <circle cx={c} cy={c} r={r} className="op-moon-lit" /> : null}
      {f > 0 && f < 1 ? (
        <path
          d={`M ${c} ${c - r} A ${r} ${r} 0 0 1 ${c} ${c + r} A ${rx} ${r} 0 0 ${sweep} ${c} ${c - r} Z`}
          className="op-moon-lit"
        />
      ) : null}
    </svg>
  );
}

function moonFraction(day: WeeklyDay) {
  if (day.status === "completed") return 1;
  if (day.status === "today" || day.status === "partial") return day.progress / 100;
  return 0;
}

export function WeeklyProgress({
  days,
  streak,
  remainingMinutes,
  accuracy,
}: {
  days: WeeklyDay[];
  streak: number;
  remainingMinutes: number;
  accuracy: number | null;
}) {
  const range = days.length > 0 ? `${days[0].dateLabel} – ${days[days.length - 1].dateLabel}` : "";

  return (
    <div className="op-lower">
      <section className="op-card" aria-label="This week">
        <h3 className="op-card-head">
          This week <span>{range}</span>
        </h3>
        <ol className="op-moons">
          {days.map((day) => (
            <li
              key={day.date}
              className={`op-moon is-${day.status}`}
              aria-label={`${day.weekday} ${day.dateLabel}: ${
                day.status === "today" ? `today, ${day.progress}% done` : STATUS_WORD[day.status]
              }${day.status === "partial" ? `, ${day.progress}%` : ""}`}
            >
              <Moon fraction={moonFraction(day)} />
              <span aria-hidden>{day.status === "today" ? "Today" : day.weekday}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="op-card" aria-label="Standing">
        <h3 className="op-card-head">
          Standing <span>at a glance</span>
        </h3>
        <dl className="op-stats">
          <div>
            <dt>
              <Flame aria-hidden />
              Streak
            </dt>
            <dd>
              {streak}
              <small>{streak === 1 ? "day" : "days"}</small>
            </dd>
          </div>
          <div>
            <dt>
              <Hourglass aria-hidden />
              Left today
            </dt>
            <dd>
              {remainingMinutes}
              <small>min</small>
            </dd>
          </div>
          <div title="Share of questions answered correctly this week">
            <dt>
              <Target aria-hidden />
              Accuracy
            </dt>
            <dd>
              {accuracy === null ? "—" : accuracy}
              {accuracy === null ? null : <small>%</small>}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
