"use client";

const ROWS = [
  {
    indicator: "steatosis values (dB/cm/MHz)",
    vitamin: "-0.41",
    control: "-0.30",
  },
  {
    indicator: "fibrosis values (kPa)",
    vitamin: "-0.35",
    control: "0.10",
  },
  {
    indicator: "fasting blood glucose (mg/dl)",
    vitamin: "-5.00",
    control: "-1.50",
  },
  {
    indicator: "fasting serum insulin (microU/ml)",
    vitamin: "-1.46",
    control: "-0.21",
  },
  {
    indicator: "homeostasis model assessment of insulin resistance (HOMA-IR)",
    vitamin: "-0.23",
    control: "0.06",
  },
];

export function Exam1FattyLiverTable() {
  return (
    <div>
      <p className="mb-2 text-center text-sm font-semibold text-[#202124]">
        Changes in Indicators of Fatty Liver Disease in Vitamin B12 and Placebo
        Groups
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs text-[#202124]">
          <thead>
            <tr className="border-b border-[#dadce0]">
              <th className="px-2 py-2 font-semibold">Indicator</th>
              <th className="px-2 py-2 font-semibold">Vitamin B12 Group</th>
              <th className="px-2 py-2 font-semibold">Control Group</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.indicator} className="border-b border-[#eee]">
                <td className="px-2 py-2 align-top">{row.indicator}</td>
                <td className="px-2 py-2 tabular-nums">{row.vitamin}</td>
                <td className="px-2 py-2 tabular-nums">{row.control}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
