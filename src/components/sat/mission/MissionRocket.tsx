/**
 * The marker that rides the mission path.
 *
 * Thin outline only, nose up: the list runs top to bottom, but a rocket
 * pointing up reads as ascent rather than descent, which is the metaphor the
 * path is for. Decorative — the step's state is already conveyed by its node
 * and card, so this is hidden from assistive tech.
 */
export function MissionRocket() {
  return (
    <span className="sat-mission-rocket" aria-hidden>
      <span className="sat-mission-rocket-trail" />
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2.5c2.6 2.4 4 5.6 4 9v3.2l-1.7 1.7H9.7L8 14.7v-3.2c0-3.4 1.4-6.6 4-9Z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="10" r="1.7" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M8 13.2 5.6 15.6l.6 2.8 1.9-1M16 13.2l2.4 2.4-.6 2.8-1.9-1"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
