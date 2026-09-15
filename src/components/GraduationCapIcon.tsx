type GraduationCapIconProps = {
  className?: string;
};

/**
 * Lucide graduation-cap mark with a hover microinteraction: the mortarboard
 * and tassel lift off the hat, then ease back into place.
 * Parent must use `group/practice` so hover/focus-visible can drive the motion.
 */
export function GraduationCapIcon({ className }: GraduationCapIconProps) {
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
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
      <g className="grad-cap-lid">
        <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
        <path d="M22 10v6" />
      </g>
    </svg>
  );
}
