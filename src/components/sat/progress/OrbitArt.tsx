/**
 * Decorative only — thin orbital geometry, a faint planet and a few stars.
 * Never carries meaning, so it is hidden from assistive tech and sits behind
 * the content at low opacity.
 */
export function OrbitArt() {
  return (
    <svg className="prog-orbit" viewBox="0 0 520 260" fill="none" aria-hidden>
      <ellipse
        cx="300"
        cy="128"
        rx="196"
        ry="86"
        stroke="currentColor"
        strokeWidth="1"
      />
      <ellipse
        cx="300"
        cy="128"
        rx="140"
        ry="122"
        stroke="currentColor"
        strokeWidth="1"
        transform="rotate(-18 300 128)"
      />
      <ellipse
        cx="300"
        cy="128"
        rx="96"
        ry="54"
        stroke="currentColor"
        strokeWidth="1"
        transform="rotate(12 300 128)"
      />

      <circle cx="300" cy="128" r="30" className="prog-orbit-planet" />
      <circle cx="300" cy="128" r="30" stroke="currentColor" strokeWidth="1" />

      <circle cx="496" cy="128" r="3.5" fill="currentColor" opacity="0.55" />
      <circle cx="176" cy="196" r="2.5" fill="currentColor" opacity="0.45" />
      <circle cx="392" cy="42" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="120" cy="74" r="1.6" fill="currentColor" opacity="0.35" />
      <circle cx="458" cy="210" r="1.6" fill="currentColor" opacity="0.3" />
    </svg>
  );
}
