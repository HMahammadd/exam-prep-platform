/**
 * Layered backdrop for the SAT workspace.
 *
 * Six layers: canvas, galaxy dust, stars, orbital lines, academic texture and
 * ambient glow. Everything is line art in one inline SVG — no image assets —
 * and nothing exceeds 8% opacity, so the dashboard content always wins.
 * Decorative only: the whole thing is aria-hidden and pointer-events: none.
 */
export function SatBackdrop() {
  return (
    <div className="sat-backdrop" aria-hidden>
      {/* Layer 2 + 6: dust and ambient glow are CSS gradients */}
      <span className="sat-bd-dust sat-bd-dust--tl" />
      <span className="sat-bd-dust sat-bd-dust--br" />
      <span className="sat-bd-glow" />

      <svg
        className="sat-bd-art"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {/* ——— Layer 4: orbital curves ——— */}
        <g className="sat-bd-orbits">
          <path d="M-60 250 C 240 120, 620 150, 900 40" />
          <path d="M-40 760 C 300 600, 780 700, 1500 470" />
          <path d="M1040 900 C 1160 720, 1340 640, 1520 610" />
          <ellipse cx="120" cy="90" rx="190" ry="52" transform="rotate(-18 120 90)" />
          <circle cx="120" cy="90" r="96" />
        </g>

        {/* ——— Layer 4: constellation ——— */}
        <g className="sat-bd-constellation">
          <path d="M1180 70 L1268 120 L1340 190 L1290 250 L1180 70 M1268 120 L1392 96" />
          <circle cx="1180" cy="70" r="5" />
          <circle cx="1268" cy="120" r="3.5" />
          <circle cx="1340" cy="190" r="4.5" />
          <circle cx="1290" cy="250" r="3" />
          <circle cx="1392" cy="96" r="3" />
        </g>

        {/* ——— Layer 5: reading passage sheet ——— */}
        <g className="sat-bd-paper" transform="rotate(-5 1120 330)">
          <rect x="980" y="200" width="300" height="270" rx="10" />
          <path d="M1008 248 H1188 M1008 276 H1246 M1008 300 H1210 M1008 324 H1252 M1008 348 H1170 M1008 372 H1238 M1008 396 H1120" />
        </g>

        {/* ——— Layer 5: answer bubble sheet ——— */}
        <g className="sat-bd-bubbles" transform="rotate(6 190 700)">
          <rect x="70" y="600" width="250" height="230" rx="10" />
          {[0, 1, 2, 3, 4].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <circle
                key={`${row}-${col}`}
                cx={118 + col * 52}
                cy={648 + row * 38}
                r="11"
              />
            ))
          )}
        </g>

        {/* ——— Layer 5: coordinate grid + parabola ——— */}
        <g className="sat-bd-graph">
          <g className="sat-bd-grid">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line key={`h${i}`} x1="1130" y1={560 + i * 34} x2="1334" y2={560 + i * 34} />
            ))}
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <line key={`v${i}`} x1={1130 + i * 34} y1="560" x2={1130 + i * 34} y2="730" />
            ))}
          </g>
          <path className="sat-bd-axis" d="M1130 690 H1334 M1232 552 V740" />
          <path className="sat-bd-curve" d="M1148 566 Q 1232 800, 1320 566" />
        </g>

        {/* ——— Layer 5: calculator ——— */}
        <g className="sat-bd-calc" transform="rotate(-8 1330 810)">
          <rect x="1276" y="742" width="108" height="140" rx="12" />
          <rect x="1292" y="758" width="76" height="22" rx="4" />
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2].map((col) => (
              <rect
                key={`k${row}-${col}`}
                x={1292 + col * 26}
                y={792 + row * 22}
                width="18"
                height="14"
                rx="3"
              />
            ))
          )}
        </g>

        {/* ——— Layer 5: progress + timer rings ——— */}
        <g className="sat-bd-rings">
          <circle cx="470" cy="180" r="54" />
          <path className="sat-bd-ring-arc" d="M470 126 A 54 54 0 0 1 516 206" />
          <circle cx="860" cy="640" r="38" />
          <path className="sat-bd-ring-arc" d="M860 602 A 38 38 0 0 1 894 660" />
        </g>

        {/* ——— Layer 3: stars ——— */}
        <g className="sat-bd-stars">
          {[
            [340, 120, 7], [620, 210, 5], [250, 330, 4], [760, 90, 6],
            [520, 470, 5], [940, 330, 4], [180, 470, 6], [700, 560, 4],
            [420, 760, 5], [1060, 480, 6], [980, 760, 4], [600, 680, 5],
            [300, 520, 4], [1120, 420, 5], [820, 250, 4],
          ].map(([x, y, s], i) => (
            <path
              key={i}
              className="sat-bd-star"
              style={{ animationDelay: `${(i % 6) * 1.2}s` }}
              d={`M${x} ${y - s} Q${x + s * 0.28} ${y - s * 0.28} ${x + s} ${y} Q${x + s * 0.28} ${y + s * 0.28} ${x} ${y + s} Q${x - s * 0.28} ${y + s * 0.28} ${x - s} ${y} Q${x - s * 0.28} ${y - s * 0.28} ${x} ${y - s} Z`}
            />
          ))}
        </g>

        {/* ——— Layer 3: dust particles ——— */}
        <g className="sat-bd-particles">
          {[
            [210, 200], [480, 300], [880, 160], [1100, 300], [360, 620],
            [720, 420], [1180, 640], [560, 140], [960, 560], [260, 820],
            [640, 820], [1020, 200],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={i % 3 === 0 ? 3 : 2}
              style={{ animationDelay: `${(i % 5) * 2.4}s` }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
