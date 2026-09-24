/**
 * First-visit state for the SAT mission briefing.
 *
 * Two levels, which is what lets the checkbox mean something:
 *   - permanent  (localStorage)   "Begin Mission", or "Don't show this again"
 *   - this visit (sessionStorage) close button / Escape / backdrop
 *
 * Same browser-local approach as the sidebar's collapsed state and the exam
 * notes — no table, and nothing here invents an API.
 */

const SEEN_KEY = "sat-briefing-seen";
const SNOOZE_KEY = "sat-briefing-snoozed";

/**
 * TEMPORARY — while the briefing is being designed it reopens on every visit
 * in development, so it can be iterated on without clearing storage each
 * time. Production is unaffected. Delete this block to restore first-visit
 * behaviour in dev too.
 */
const ALWAYS_SHOW_IN_DEV = true;

export function shouldShowBriefing(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  // ?briefing=1 forces it open regardless of storage or environment — a
  // reliable way to reopen it when a cached bundle makes the dev flag below
  // look broken.
  try {
    if (new URLSearchParams(window.location.search).has("briefing")) {
      return true;
    }
  } catch {
    // no URL access — fall through
  }

  if (ALWAYS_SHOW_IN_DEV && process.env.NODE_ENV === "development") {
    return true;
  }

  try {
    if (localStorage.getItem(SEEN_KEY) === "1") return false;
    if (sessionStorage.getItem(SNOOZE_KEY) === "1") return false;
  } catch {
    // Storage blocked — show it rather than suppress it forever.
    return true;
  }
  return true;
}

/** Never show it again on this browser. */
export function dismissBriefingForever() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // nothing to persist to
  }
}

/** Hide it until the next visit. */
export function snoozeBriefing() {
  try {
    sessionStorage.setItem(SNOOZE_KEY, "1");
  } catch {
    // nothing to persist to
  }
}
