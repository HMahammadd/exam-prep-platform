"use client";

const ROWS = [
  {
    individual: "George Washington",
    years: "1754–1799",
    works: "47 letters; 10 public speeches",
  },
  {
    individual: "John Adams",
    years: "1735–1826",
    works: "15 books; 50 letters; 5 public speeches",
  },
  {
    individual: "Thomas Jefferson",
    years: "1743–1826",
    works: "20 books; 75 letters; 10 public speeches",
  },
  {
    individual: "James Madison",
    years: "1751–1836",
    works: "12 books; 60 letters; 15 public speeches",
  },
];

export function Exam3PresidentsTable() {
  return (
    <div>
      <p className="mb-2 text-center text-sm font-semibold text-[#202124]">
        Credited Writing Output of the First 4 US Presidents
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs text-[#202124]">
          <thead>
            <tr className="border-b border-[#dadce0]">
              <th className="px-2 py-2 font-semibold">Individual</th>
              <th className="px-2 py-2 font-semibold">Years</th>
              <th className="px-2 py-2 font-semibold">Number of Works Written</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.individual} className="border-b border-[#eee]">
                <td className="px-2 py-2">{row.individual}</td>
                <td className="px-2 py-2 tabular-nums">{row.years}</td>
                <td className="px-2 py-2">{row.works}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
