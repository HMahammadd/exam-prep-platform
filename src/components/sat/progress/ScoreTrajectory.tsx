/**
 * Thin-line chart, hand-built in SVG.
 *
 * Four points do not justify pulling recharts into this route — the whole
 * chart is a polyline, five gridlines and four dots, and staying with SVG
 * keeps the page a server component with no client JS.
 */

type Point = { label: string; value: number };

const MIN = 800;
const MAX = 1600;
const STEP = 200;

// Viewbox units; the SVG scales to the panel via width:100%.
const W = 760;
const H = 300;
const PAD_L = 46;
const PAD_R = 18;
const PAD_T = 26;
const PAD_B = 34;

export function ScoreTrajectory({ points }: { points: Point[] }) {
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const x = (i: number) =>
    PAD_L + (points.length === 1 ? innerW / 2 : (innerW * i) / (points.length - 1));
  const y = (v: number) =>
    PAD_T + innerH - ((v - MIN) / (MAX - MIN)) * innerH;

  const line = points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ");
  const area = `${PAD_L},${PAD_T + innerH} ${line} ${x(points.length - 1)},${
    PAD_T + innerH
  }`;

  const ticks: number[] = [];
  for (let v = MIN; v <= MAX; v += STEP) ticks.push(v);

  return (
    <svg
      className="prog-chart"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Score trajectory from ${points[0]?.value} to ${
        points[points.length - 1]?.value
      }`}
    >
      {ticks.map((v) => (
        <g key={v}>
          <line
            x1={PAD_L}
            x2={W - PAD_R}
            y1={y(v)}
            y2={y(v)}
            className="prog-chart-grid"
          />
          <text x={PAD_L - 10} y={y(v) + 4} className="prog-chart-axis" textAnchor="end">
            {v}
          </text>
        </g>
      ))}

      <polygon points={area} className="prog-chart-area" />
      <polyline points={line} className="prog-chart-line" />

      {points.map((p, i) => (
        <g key={p.label}>
          <circle cx={x(i)} cy={y(p.value)} r="5" className="prog-chart-dot" />
          <text
            x={x(i)}
            y={y(p.value) - 15}
            className="prog-chart-value"
            textAnchor="middle"
          >
            {p.value}
          </text>
          <text
            x={x(i)}
            y={H - 10}
            className="prog-chart-axis"
            textAnchor="middle"
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
