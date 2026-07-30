"use client";

const ROWS = [
  { name: "Laura", wind: "130", surge: "12–18" },
  { name: "Delta", wind: "120", surge: "6–9" },
  { name: "Eta", wind: "125", surge: "26–33" },
  { name: "Iota", wind: "135", surge: "26+" },
  { name: "Zeta", wind: "100", surge: "6–10" },
];

export function Exam3HurricanesTable() {
  return (
    <div>
      <p className="mb-2 text-center text-sm font-semibold text-[#202124]">
        Characteristics of Five Major Hurricanes in 2020 at Landfall
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs text-[#202124]">
          <thead>
            <tr className="border-b border-[#dadce0]">
              <th className="px-2 py-2 font-semibold">Hurricane Name</th>
              <th className="px-2 py-2 font-semibold">
                Maximum Sustained Wind Speed (mph)
              </th>
              <th className="px-2 py-2 font-semibold">Storm Surge Height (ft)</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.name} className="border-b border-[#eee]">
                <td className="px-2 py-2">{row.name}</td>
                <td className="px-2 py-2 tabular-nums">{row.wind}</td>
                <td className="px-2 py-2 tabular-nums">{row.surge}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
