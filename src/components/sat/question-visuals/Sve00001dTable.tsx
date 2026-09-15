const ROWS = [
  {
    title: "Excitebike",
    units: "4,160,000",
    year: "1984",
    genre: "racing",
    developer: "Nintendo R&D1",
  },
  {
    title: "The Last Ninja 2",
    units: "5,500,000",
    year: "1988",
    genre: "action-adventure",
    developer: "System 3",
  },
  {
    title: "Zelda II: The Adventure of Link",
    units: "4,380,000",
    year: "1987",
    genre: "action-adventure",
    developer: "Nintendo EAD",
  },
  {
    title: "Frogger",
    units: "4,100,000",
    year: "1982",
    genre: "action",
    developer: "Konami",
  },
];

export function Sve00001dTable() {
  return (
    <figure className="overflow-hidden rounded-xl border border-[#d7dbe0] bg-white text-[#1f1f1f] shadow-sm">
      <figcaption className="border-b border-[#d7dbe0] px-4 py-3 text-center text-sm font-semibold tracking-tight">
        Home Video Games and Computer Games of the 1980s
      </figcaption>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-[#f6f7f9]">
              <th className="border-b border-r border-[#d7dbe0] px-3 py-2.5 font-semibold">
                Title
              </th>
              <th className="border-b border-r border-[#d7dbe0] px-3 py-2.5 text-center font-semibold">
                Approximate number of units sold worldwide
              </th>
              <th className="border-b border-r border-[#d7dbe0] px-3 py-2.5 text-center font-semibold">
                Release year
              </th>
              <th className="border-b border-r border-[#d7dbe0] px-3 py-2.5 text-center font-semibold">
                Genre
              </th>
              <th className="border-b border-[#d7dbe0] px-3 py-2.5 text-center font-semibold">
                Developer
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, index) => (
              <tr key={row.title}>
                <td
                  className={`border-r border-[#e6e8eb] px-3 py-2.5 italic ${
                    index < ROWS.length - 1 ? "border-b" : ""
                  }`}
                >
                  {row.title}
                </td>
                <td
                  className={`border-r border-[#e6e8eb] px-3 py-2.5 text-center tabular-nums ${
                    index < ROWS.length - 1 ? "border-b" : ""
                  }`}
                >
                  {row.units}
                </td>
                <td
                  className={`border-r border-[#e6e8eb] px-3 py-2.5 text-center tabular-nums ${
                    index < ROWS.length - 1 ? "border-b" : ""
                  }`}
                >
                  {row.year}
                </td>
                <td
                  className={`border-r border-[#e6e8eb] px-3 py-2.5 text-center ${
                    index < ROWS.length - 1 ? "border-b" : ""
                  }`}
                >
                  {row.genre}
                </td>
                <td
                  className={`px-3 py-2.5 text-center ${
                    index < ROWS.length - 1 ? "border-b border-[#e6e8eb]" : ""
                  }`}
                >
                  {row.developer}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
