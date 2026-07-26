export function Sinaq10Q19TriangleDiagram() {
  return (
    <svg
      viewBox="0 0 260 220"
      className="mx-auto my-4 h-auto w-full max-w-sm text-foreground"
      aria-label="Bərabərtərəfli ABC üçbucağı, DE ∥ AC"
      role="img"
    >
      {/* Equilateral triangle ABC — B top, A bottom-left, C bottom-right */}
      <polygon
        points="130,30 40,190 220,190"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* DE parallel to AC */}
      <line
        x1="70"
        y1="123"
        x2="190"
        y2="123"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Vertices */}
      <circle cx="130" cy="30" r="3" fill="currentColor" />
      <text x="126" y="20" fontSize="14" fontStyle="italic" fill="currentColor">
        B
      </text>
      <circle cx="40" cy="190" r="3" fill="currentColor" />
      <text x="24" y="206" fontSize="14" fontStyle="italic" fill="currentColor">
        A
      </text>
      <circle cx="220" cy="190" r="3" fill="currentColor" />
      <text x="224" y="206" fontSize="14" fontStyle="italic" fill="currentColor">
        C
      </text>
      {/* D on AB, E on BC */}
      <circle cx="70" cy="123" r="3" fill="currentColor" />
      <text x="54" y="118" fontSize="14" fontStyle="italic" fill="currentColor">
        D
      </text>
      <circle cx="190" cy="123" r="3" fill="currentColor" />
      <text x="196" y="118" fontSize="14" fontStyle="italic" fill="currentColor">
        E
      </text>
      {/* G centroid on DE */}
      <circle cx="130" cy="123" r="3" fill="currentColor" />
      <text x="134" y="118" fontSize="14" fontStyle="italic" fill="currentColor">
        G
      </text>
      {/* Parallel marks on DE and AC */}
      <line x1="95" y1="118" x2="105" y2="128" stroke="currentColor" strokeWidth="1" />
      <line x1="100" y1="113" x2="110" y2="123" stroke="currentColor" strokeWidth="1" />
      <line x1="115" y1="188" x2="125" y2="198" stroke="currentColor" strokeWidth="1" />
      <line x1="120" y1="183" x2="130" y2="193" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
