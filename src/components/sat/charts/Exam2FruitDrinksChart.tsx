"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/** Values approximate the study graph; juice disclosure ≈ control supports answer B. */
const DATA = [
  { condition: "Control", percent: 33 },
  { condition: "No claim", percent: 28 },
  { condition: "No imagery", percent: 27 },
  { condition: "No claim or imagery", percent: 22 },
  { condition: "% juice disclosed", percent: 32 },
  { condition: "Warning", percent: 18 },
  { condition: "Added sugar disclosed", percent: 20 },
];

export function Exam2FruitDrinksChart() {
  return (
    <div>
      <p className="mb-2 text-center text-sm font-semibold text-[#202124]">
        Participants Selecting High-Added-Sugar Fruit Drink by Packaging
        Condition
      </p>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={DATA}
            margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="condition"
              interval={0}
              angle={-25}
              textAnchor="end"
              tick={{ fontSize: 10 }}
              height={60}
            />
            <YAxis
              domain={[0, 40]}
              tick={{ fontSize: 12 }}
              label={{
                value: "% selecting drink",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11 },
              }}
            />
            <Tooltip />
            <Bar dataKey="percent" name="% selecting" fill="#3b5998" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
