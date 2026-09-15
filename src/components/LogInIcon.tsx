import { useId } from "react";

type LogInIconProps = {
  className?: string;
};

const DOORWAY = "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4";

/**
 * Lucide log-in mark with a hover microinteraction: the arrow glides into
 * the doorway, the portal answers with a brief glow, then the arrow returns.
 * Parent must use `group/login` so hover/focus-visible can drive the motion.
 */
export function LogInIcon({ className }: LogInIconProps) {
  const uid = useId().replace(/:/g, "");
  const fadeId = `login-arrow-fade-${uid}`;
  const maskId = `login-arrow-mask-${uid}`;
  const portalClipId = `login-portal-clip-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className ?? ""}`}
      aria-hidden
    >
      <defs>
        <linearGradient
          id={fadeId}
          x1="16.2"
          y1="0"
          x2="17.4"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          maskContentUnits="userSpaceOnUse"
        >
          <rect x="-4" y="-2" width="22" height="28" fill={`url(#${fadeId})`} />
        </mask>
        <clipPath id={portalClipId} clipPathUnits="userSpaceOnUse">
          <rect x="14.5" y="4" width="7.5" height="16" rx="1.5" />
        </clipPath>
      </defs>

      <g mask={`url(#${maskId})`}>
        <g className="login-icon-arrow-trail">
          <path d="m10 17 5-5-5-5" />
          <path d="M15 12H3" />
        </g>
        <g className="login-icon-arrow">
          <path d="m10 17 5-5-5-5" />
          <path d="M15 12H3" />
        </g>
      </g>

      <g clipPath={`url(#${portalClipId})`}>
        <ellipse
          className="login-icon-portal"
          cx="18.4"
          cy="12"
          rx="3.4"
          ry="7.2"
          fill="currentColor"
          stroke="none"
        />
      </g>

      <path className="login-icon-door-glow" d={DOORWAY} />
      <path className="login-icon-door" d={DOORWAY} />
    </svg>
  );
}
