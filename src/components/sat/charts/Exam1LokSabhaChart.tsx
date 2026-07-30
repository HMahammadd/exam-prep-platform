"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DATA = [
  { year: "1999", bjp: 33, congress: 21, cpi: 6, other: 40 },
  { year: "2004", bjp: 25, congress: 27, cpi: 8, other: 40 },
  { year: "2009", bjp: 21, congress: 38, cpi: 4, other: 37 },
  { year: "2014", bjp: 52, congress: 8, cpi: 7, other: 33 },
  { year: "2019", bjp: 56, congress: 10, cpi: 4, other: 30 },
];

export function Exam1LokSabhaChart() {
  return (
    <div>
      <p className="mb-2 text-center text-sm font-semibold text-[#202124]">
        Indian Lok Sabha Results by Percentage of Seats Won, 1999–2019
      </p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={DATA} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis
              domain={[0, 60]}
              tick={{ fontSize: 12 }}
              label={{
                value: "% of seats",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11 },
              }}
            />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="bjp"
              name="Bharatiya Janata Party"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="congress"
              name="Indian National Congress"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="cpi"
              name="Communist Party of India (Marxist)"
              stroke="#dc2626"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="other"
              name="Other"
              stroke="#6b7280"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
