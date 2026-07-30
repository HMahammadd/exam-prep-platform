"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/** Central electronics/home goods near 50% supports answer C. */
const DATA = [
  { category: "Clothing", north: 72, central: 68, south: 82 },
  { category: "Electronics", north: 28, central: 50, south: 35 },
  { category: "Home Goods", north: 61, central: 52, south: 44 },
];

export function Exam3ShoppingChart() {
  return (
    <div>
      <p className="mb-2 text-center text-sm font-semibold text-[#202124]">
        Percentage of Customers Who Are Female, by Region and Type of Purchase
      </p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DATA} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="category" tick={{ fontSize: 12 }} />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              label={{
                value: "% female customers",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11 },
              }}
            />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="north" name="North" fill="#2563eb" radius={[3, 3, 0, 0]} />
            <Bar dataKey="central" name="Central" fill="#16a34a" radius={[3, 3, 0, 0]} />
            <Bar dataKey="south" name="South" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
