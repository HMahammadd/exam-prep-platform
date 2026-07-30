"use client";

const ROWS = [
  {
    measure: "Need satisfaction scale, reflexive stage",
    humanExcl: "3.13",
    humanIncl: "5.88",
    computerExcl: "3.29",
    computerIncl: "5.94",
  },
  {
    measure: "Mood, reflexive stage",
    humanExcl: "3.29",
    humanIncl: "5.50",
    computerExcl: "3.43",
    computerIncl: "4.59",
  },
  {
    measure: "Need satisfaction scale, reflective stage",
    humanExcl: "3.38",
    humanIncl: "5.03",
    computerExcl: "3.81",
    computerIncl: "5.38",
  },
  {
    measure: "Mood, reflective stage",
    humanExcl: "3.46",
    humanIncl: "4.71",
    computerExcl: "4.43",
    computerIncl: "4.09",
  },
];

export function Exam2SocialExclusionTable() {
  return (
    <div>
      <p className="mb-2 text-center text-sm font-semibold text-[#202124]">
        Need Satisfaction and Mood After Social Exclusion or Inclusion
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs text-[#202124]">
          <thead>
            <tr className="border-b border-[#dadce0]">
              <th className="px-2 py-2 font-semibold">Measure</th>
              <th className="px-2 py-2 font-semibold">Human exclusion</th>
              <th className="px-2 py-2 font-semibold">Human inclusion</th>
              <th className="px-2 py-2 font-semibold">Computer exclusion</th>
              <th className="px-2 py-2 font-semibold">Computer inclusion</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.measure} className="border-b border-[#eee]">
                <td className="px-2 py-2 align-top">{row.measure}</td>
                <td className="px-2 py-2 tabular-nums">{row.humanExcl}</td>
                <td className="px-2 py-2 tabular-nums">{row.humanIncl}</td>
                <td className="px-2 py-2 tabular-nums">{row.computerExcl}</td>
                <td className="px-2 py-2 tabular-nums">{row.computerIncl}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
