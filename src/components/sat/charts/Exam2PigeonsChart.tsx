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

/** Approximate lines of best fit matching the answer key (spring: ~4 at 10, ~11 at 30). */
const DATA = [
  { restaurants: 0, spring: 1, winter: 2 },
  { restaurants: 5, spring: 2.5, winter: 2.8 },
  { restaurants: 10, spring: 4, winter: 3.5 },
  { restaurants: 15, spring: 5.8, winter: 4.2 },
  { restaurants: 20, spring: 7.5, winter: 4.8 },
  { restaurants: 25, spring: 9.2, winter: 5.4 },
  { restaurants: 30, spring: 11, winter: 6 },
];

export function Exam2PigeonsChart() {
  return (
    <div>
      <p className="mb-2 text-center text-sm font-semibold text-[#202124]">
        Rock Pigeon Abundance vs. Nearby Restaurants
      </p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={DATA} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="restaurants"
              tick={{ fontSize: 12 }}
              label={{
                value: "Restaurants within 1 km",
                position: "insideBottom",
                offset: -2,
                style: { fontSize: 11 },
              }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{
                value: "Rock pigeons",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11 },
              }}
            />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="spring"
              name="Spring"
              stroke="#16a34a"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="winter"
              name="Winter"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
