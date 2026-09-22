/**
 * The briefing's right panel — the reference composition, drawn.
 *
 * Structure, left to right: an angled window pillar, the view (a planet limb
 * with a warm terminator rim), a sill carrying a helmet and a stack of four
 * books, and a right-hand column with the wordmark running up it.
 *
 * Drawn rather than photographed so the one composition can be dark in Night
 * and bright in Day, and so nothing here is generated imagery. Colours are
 * theme tokens; only the rim keeps a warm hue, because a sunrise is warm in
 * every palette.
 *
 * Decorative: the copy beside it carries the meaning, so this is aria-hidden.
 */
export function MissionScene() {
  const books = ["Practice", "Analyze", "Improve", "Repeat"];

  return (
    <svg
      className="brief-scene"
      viewBox="0 0 550 610"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        {/* Space: darker overhead, opening up toward the horizon. */}
        <linearGradient id="brief-space" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" className="brief-space-top" />
          <stop offset="100%" className="brief-space-bottom" />
        </linearGradient>

        {/* Planet: lit on the upper right, falling away to the terminator. */}
        <linearGradient id="brief-planet" x1="0.85" y1="0" x2="0.1" y2="0.9">
          <stop offset="0%" className="brief-planet-lit" />
          <stop offset="55%" className="brief-planet-mid" />
          <stop offset="100%" className="brief-planet-dark" />
        </linearGradient>

        {/* The rim: brightest where the sun grazes, fading both ways. */}
        <linearGradient id="brief-rim" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="48%" className="brief-rim-hot" />
          <stop offset="100%" className="brief-rim-cool" />
        </linearGradient>

        <radialGradient id="brief-glow" cx="0.74" cy="0.64" r="0.6">
          <stop offset="0%" className="brief-glow-in" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      <rect width="550" height="610" fill="url(#brief-space)" />
      <rect width="550" height="610" fill="url(#brief-glow)" />

      <g className="brief-stars">
        <circle cx="168" cy="92" r="1.4" />
        <circle cx="246" cy="58" r="1" />
        <circle cx="318" cy="126" r="1.1" />
        <circle cx="404" cy="72" r="1" />
        <circle cx="140" cy="206" r="1" />
        <circle cx="286" cy="188" r="1.3" />
        <circle cx="196" cy="290" r="1" />
        <circle cx="366" cy="242" r="1" />
      </g>

      {/* —— the planet —— */}
      <circle cx="340" cy="790" r="500" fill="url(#brief-planet)" />
      <path
        d="M-160 790 A 500 500 0 0 1 840 790"
        fill="none"
        stroke="url(#brief-rim)"
        strokeWidth="16"
        className="brief-rim-soft"
      />
      <path
        d="M-160 790 A 500 500 0 0 1 840 790"
        fill="none"
        stroke="url(#brief-rim)"
        strokeWidth="3"
        className="brief-rim"
      />

      {/* —— sill —— */}
      <rect x="0" y="524" width="550" height="86" className="brief-sill" />
      <rect x="0" y="524" width="550" height="2" className="brief-sill-edge" />

      {/* —— helmet —— */}
      <g className="brief-helmet">
        <path
          d="M150 524 v-26 a54 54 0 0 1 108 0 v26 z"
          className="brief-helmet-shell"
        />
        <path
          d="M165 517 a39 39 0 0 1 78 0 v7 h-78 z"
          className="brief-helmet-visor"
        />
        <path
          d="M176 502 a31 31 0 0 1 25 -21"
          className="brief-helmet-gleam"
        />
      </g>

      {/* —— four books, one per step of the loop —— */}
      <g className="brief-books">
        {books.map((label, i) => (
          <g key={label}>
            <rect
              x={318 - i * 5}
              y={440 + i * 21}
              width={162 + i * 5}
              height="20"
              className="brief-book"
            />
            <rect
              x={318 - i * 5}
              y={440 + i * 21}
              width={162 + i * 5}
              height="20"
              className="brief-book-edge"
            />
            <text
              x={332 - i * 5}
              y={454 + i * 21}
              className="brief-book-label"
            >
              {label.toUpperCase()}
            </text>
          </g>
        ))}
      </g>

      {/* —— window structure: angled pillar left, column right, beam above —— */}
      <g className="brief-structure">
        <path d="M0 0 H56 L82 610 H0 Z" />
        <path d="M478 0 H550 V610 H498 Z" />
        <rect x="0" y="0" width="550" height="26" />
      </g>
      <g className="brief-structure-edge">
        <path d="M56 0 L82 610" />
        <path d="M478 0 L498 610" />
      </g>
    </svg>
  );
}
