function SunArtwork() {
  return (
    <svg viewBox="0 0 240 240" className="hero-celestial-svg" aria-hidden>
      <defs>
        <radialGradient id="hero-sun-corona" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd34a" stopOpacity="0.58" />
          <stop offset="52%" stopColor="#ffb020" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ffb020" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hero-sun-disk" cx="36%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#ffe566" />
          <stop offset="48%" stopColor="#ffcc00" />
          <stop offset="100%" stopColor="#efb000" />
        </radialGradient>
      </defs>
      <circle
        className="hero-sun-corona"
        cx="120"
        cy="120"
        r="108"
        fill="url(#hero-sun-corona)"
      />
      <g className="hero-sun-rays">
        {Array.from({ length: 12 }, (_, i) => (
          <rect
            key={i}
            x="114"
            y="16"
            width="12"
            height="40"
            rx="6"
            fill="#ffc107"
            transform={`rotate(${i * 30} 120 120)`}
          />
        ))}
      </g>
      <circle cx="120" cy="120" r="54" fill="url(#hero-sun-disk)" />
      <ellipse
        className="hero-sun-boil"
        cx="100"
        cy="100"
        rx="30"
        ry="26"
        fill="#fff4b0"
        opacity="0.55"
      />
      <ellipse
        className="hero-sun-boil hero-sun-boil-b"
        cx="132"
        cy="122"
        rx="20"
        ry="16"
        fill="#ffe14a"
        opacity="0.32"
      />
    </svg>
  );
}

function Spark({
  cx,
  cy,
  size,
  className,
}: {
  cx: number;
  cy: number;
  size: number;
  className: string;
}) {
  const s = size / 24;
  return (
    <path
      className={className}
      fill="currentColor"
      transform={`translate(${cx - size / 2} ${cy - size / 2}) scale(${s})`}
      d="M12 2.2 13.9 9.1 21 12 13.9 14.9 12 21.8 10.1 14.9 3 12 10.1 9.1Z"
    />
  );
}

function MoonArtwork() {
  return (
    <svg viewBox="0 0 240 240" className="hero-celestial-svg" aria-hidden>
      <defs>
        <radialGradient id="hero-moon-glow" cx="48%" cy="52%" r="50%">
          <stop offset="0%" stopColor="#f4f7ff" stopOpacity="0.34" />
          <stop offset="58%" stopColor="#c9d4ea" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#c9d4ea" stopOpacity="0" />
        </radialGradient>
        <mask id="hero-moon-crescent">
          <rect width="240" height="240" fill="black" />
          <circle cx="108" cy="132" r="72" fill="white" />
          <circle cx="142" cy="112" r="60" fill="black" />
        </mask>
      </defs>
      <circle
        className="hero-moon-aura"
        cx="124"
        cy="128"
        r="104"
        fill="url(#hero-moon-glow)"
      />
      <g className="hero-moon-body text-[#eef2f8]">
        <circle
          cx="108"
          cy="132"
          r="72"
          fill="currentColor"
          mask="url(#hero-moon-crescent)"
        />
        <Spark cx="142" cy="70" size="34" className="hero-moon-star hero-moon-star-a" />
        <Spark cx="178" cy="52" size="22" className="hero-moon-star hero-moon-star-b" />
        <Spark cx="186" cy="102" size="18" className="hero-moon-star hero-moon-star-c" />
        <circle className="hero-moon-dot" cx="114" cy="90" r="6.5" fill="currentColor" />
        <circle className="hero-moon-dot hero-moon-dot-b" cx="136" cy="128" r="4" fill="currentColor" />
      </g>
    </svg>
  );
}

export function HeroCelestial() {
  return (
    <div className="hero-celestial" aria-hidden>
      <div className="hero-celestial-face hero-celestial-face--sun">
        <SunArtwork />
      </div>
      <div className="hero-celestial-face hero-celestial-face--moon">
        <MoonArtwork />
      </div>
    </div>
  );
}
