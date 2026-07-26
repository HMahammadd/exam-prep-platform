export function Sinaq10Q11CircleDiagram() {
  return (
    <svg
      viewBox="0 0 220 200"
      className="mx-auto my-4 h-auto w-full max-w-xs text-foreground"
      aria-label="Çevrədə A, B, C nöqtələri"
      role="img"
    >
      <circle
        cx="110"
        cy="100"
        r="75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* A — left */}
      <circle cx="42" cy="100" r="3" fill="currentColor" />
      <text x="28" y="104" fontSize="14" fontStyle="italic" fill="currentColor">
        A
      </text>
      {/* B — top */}
      <circle cx="110" cy="28" r="3" fill="currentColor" />
      <text x="116" y="24" fontSize="14" fontStyle="italic" fill="currentColor">
        B
      </text>
      {/* C — right */}
      <circle cx="178" cy="100" r="3" fill="currentColor" />
      <text x="184" y="104" fontSize="14" fontStyle="italic" fill="currentColor">
        C
      </text>
      {/* Triangle chords */}
      <line
        x1="42"
        y1="100"
        x2="110"
        y2="28"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line
        x1="110"
        y1="28"
        x2="178"
        y2="100"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line
        x1="42"
        y1="100"
        x2="178"
        y2="100"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Major arc indicator (A through B to C, upper side) */}
      <path
        d="M 42 100 A 75 75 0 1 1 178 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 3"
      />
    </svg>
  );
}
