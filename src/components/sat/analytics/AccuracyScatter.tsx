"use client";

import {
  CartesianGrid,
  ReferenceArea,
  Scatter,
  ScatterChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export type ScatterPoint = { seconds: number; accuracy: number };

type AccuracyScatterProps = {
  correct: ScatterPoint[];
  incorrect: ScatterPoint[];
};

const TICK = {
  fontSize: 11,
  fill: "var(--muted)",
};

function formatSeconds(value: number) {
  if (value === 0) return "0s";
  if (value < 60) return `${value}s`;
  const minutes = Math.floor(value / 60);
  const rest = value % 60;
  return rest ? `${minutes}m ${rest}s` : `${minutes}m`;
}

/**
 * One dot per question: time spent against whether it was answered correctly.
 * Two series only — accent for correct, warm for incorrect — so the chart
 * stays inside the theme rather than introducing a chart palette.
 */
export function AccuracyScatter({ correct, incorrect }: AccuracyScatterProps) {
  return (
    <div className="anl-scatter">
      <ResponsiveContainer width="100%" height={260}>
        <ScatterChart margin={{ top: 8, right: 12, bottom: 18, left: 0 }}>
          <CartesianGrid
            stroke="var(--prog-line)"
            strokeDasharray="0"
            vertical={false}
          />

          {/* Fast and correct — labelled in the markup, not baked into the SVG. */}
          <ReferenceArea
            x1={0}
            x2={60}
            y1={70}
            y2={100}
            fill="var(--accent)"
            fillOpacity={0.05}
            stroke="var(--prog-line)"
          />

          <XAxis
            type="number"
            dataKey="seconds"
            domain={[0, 180]}
            ticks={[0, 30, 60, 120, 180]}
            tickFormatter={formatSeconds}
            tick={TICK}
            tickLine={false}
            axisLine={{ stroke: "var(--prog-line)" }}
            label={{
              value: "Time per question",
              position: "insideBottom",
              offset: -12,
              style: { fontSize: 11, fill: "var(--muted)" },
            }}
          />
          <YAxis
            type="number"
            dataKey="accuracy"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(value: number) => `${value}%`}
            tick={TICK}
            tickLine={false}
            axisLine={false}
            width={44}
          />

          <Scatter
            name="Correct"
            data={correct}
            fill="var(--accent)"
            fillOpacity={0.75}
          />
          <Scatter
            name="Incorrect"
            data={incorrect}
            fill="var(--anl-warm)"
            fillOpacity={0.75}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
