import type { CSSProperties } from "react";
import type { MissionTaskId, MissionTaskSummary } from "@/types/daily-mission";

/*
 * Top-down "orbit plan": the sun is today's progress, each task is a planet on
 * its own circular orbit. Every planet starts at 12 o'clock and travels
 * clockwise as its task's questions are answered, so a closed orbit is a
 * finished task. The outer bezel has one segment per question of the day.
 */
const VIEW_W = 600;
const VIEW_H = 440;
const CX = 300;
const CY = 222;
const SUN_R = 44;
const ORBIT_R = [76, 108, 140, 172];
const BEZEL_R = 204;

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Degrees clockwise from 12 o'clock. Rounded because Node and the browser
 * disagree in the last float digits of sin/cos, which breaks hydration.
 */
function point(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: round(CX + r * Math.sin(rad)), y: round(CY - r * Math.cos(rad)) };
}

function arcPath(r: number, from: number, to: number) {
  const a = point(r, from);
  const b = point(r, to);
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${b.x} ${b.y}`;
}

function taskFraction(task: MissionTaskSummary) {
  if (task.status === "completed" || task.total === 0) return 1;
  return Math.max(0, Math.min(1, task.completed / task.total));
}

function Bezel({ completed, total }: { completed: number; total: number }) {
  const count = Math.max(total, 1);
  const step = 360 / count;
  const gap = Math.min(2.4, step * 0.3);
  return (
    <g aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const state = i < completed ? "is-done" : i === completed ? "is-next" : "is-rest";
        return (
          <path
            key={i}
            className={`op-bezel-seg ${state}`}
            d={arcPath(BEZEL_R, i * step + gap / 2, (i + 1) * step - gap / 2)}
          />
        );
      })}
      {Array.from({ length: 60 }, (_, i) => {
        const major = i % 5 === 0;
        const a = point(BEZEL_R - 9, i * 6);
        const b = point(BEZEL_R - 9 - (major ? 5 : 2.5), i * 6);
        return <line key={i} className="op-tick" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
      })}
    </g>
  );
}

function Planet({ task, r, fraction }: { task: MissionTaskSummary; r: number; fraction: number }) {
  const angle = task.status === "completed" ? 0 : fraction * 360;
  const { x, y } = point(r, angle);

  if (task.status === "completed") {
    return (
      <g className="op-planet is-completed">
        <circle cx={x} cy={y} r={7} />
        <path d={`M ${x - 3} ${y} l 2.1 2.2 l 4 -4.4`} className="op-planet-check" />
      </g>
    );
  }

  if (task.status === "current") {
    // Keep the counter clear of the start line when the planet is near 12.
    const nearTop = angle < 24 || angle > 336;
    const out = point(r + 22, angle);
    const side = Math.sin((angle * Math.PI) / 180);
    const label = nearTop
      ? { x: x + 16, y: y + 4, anchor: "start" as const }
      : { x: out.x, y: out.y + 4, anchor: side > 0.3 ? ("start" as const) : side < -0.3 ? ("end" as const) : ("middle" as const) };
    return (
      <g className="op-planet is-current">
        <circle cx={x} cy={y} r={14} className="op-planet-halo" />
        <circle cx={x} cy={y} r={7.5} />
        <text x={label.x} y={label.y} textAnchor={label.anchor} className="op-planet-count">
          {task.completed} / {task.total}
        </text>
      </g>
    );
  }

  return (
    <g className="op-planet is-upcoming">
      <circle cx={x} cy={y} r={5.5} />
    </g>
  );
}

export function OrbitPlan({
  tasks,
  progress,
  completed,
  total,
  active,
  onActive,
}: {
  tasks: MissionTaskSummary[];
  progress: number;
  completed: number;
  total: number;
  active: MissionTaskId | null;
  onActive: (id: MissionTaskId | null) => void;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));
  const summary = tasks
    .map((task) =>
      task.status === "completed"
        ? `${task.title} done`
        : `${task.title} ${task.completed} of ${task.total}`
    )
    .join(", ");

  return (
    <svg
      className="op-orbit"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label={`Today's orbit: ${clamped}% complete. ${summary}.`}
    >
      <defs>
        <radialGradient id="op-sun-fill" cx="38%" cy="34%" r="72%">
          <stop offset="0%" className="op-sun-stop-core" />
          <stop offset="100%" className="op-sun-stop-edge" />
        </radialGradient>
        <radialGradient id="op-sun-halo">
          <stop offset="0%" className="op-sun-stop-halo" />
          <stop offset="100%" className="op-sun-stop-clear" />
        </radialGradient>
      </defs>

      <Bezel completed={completed} total={total} />

      <line className="op-startline" x1={CX} y1={CY - ORBIT_R[3] - 12} x2={CX} y2={CY - SUN_R - 12} />

      {tasks.map((task, i) => {
        const r = ORBIT_R[i] ?? ORBIT_R[ORBIT_R.length - 1];
        const fraction = taskFraction(task);
        const dim = active !== null && active !== task.id;
        return (
          <g
            key={task.id}
            className={`op-orbit-group is-${task.status}${dim ? " is-dim" : ""}`}
            style={{ "--i": i } as CSSProperties}
            onPointerEnter={() => onActive(task.id)}
            onPointerLeave={() => onActive(null)}
          >
            <circle cx={CX} cy={CY} r={r} className="op-orbit-track" />
            <circle cx={CX} cy={CY} r={r + 8} className="op-orbit-hit" />
            {task.status === "completed" ? (
              <circle
                cx={CX}
                cy={CY}
                r={r}
                pathLength={100}
                transform={`rotate(-90 ${CX} ${CY})`}
                className="op-orbit-arc op-draw"
              />
            ) : fraction > 0 ? (
              <path d={arcPath(r, 0, fraction * 360)} pathLength={100} className="op-orbit-arc op-draw" />
            ) : null}
          </g>
        );
      })}

      <circle cx={CX} cy={CY} r={SUN_R + 26} fill="url(#op-sun-halo)" />
      <circle cx={CX} cy={CY} r={SUN_R} fill="url(#op-sun-fill)" />
      <text x={CX} y={CY + 5} textAnchor="middle" className="op-sun-value">
        {clamped}%
      </text>
      <text x={CX} y={CY + 21} textAnchor="middle" className="op-sun-label">
        TODAY
      </text>

      {tasks.map((task, i) => {
        const r = ORBIT_R[i] ?? ORBIT_R[ORBIT_R.length - 1];
        const dim = active !== null && active !== task.id;
        return (
          <g
            key={task.id}
            className={`op-planet-group is-${task.status}${dim ? " is-dim" : ""}`}
            style={{ "--i": i } as CSSProperties}
            onPointerEnter={() => onActive(task.id)}
            onPointerLeave={() => onActive(null)}
          >
            <text x={CX - 13} y={CY - r + 3.8} textAnchor="end" className="op-orbit-num">
              {String(i + 1).padStart(2, "0")}
            </text>
            <Planet task={task} r={r} fraction={taskFraction(task)} />
          </g>
        );
      })}
    </svg>
  );
}
