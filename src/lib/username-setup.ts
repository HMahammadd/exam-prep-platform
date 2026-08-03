/** Auto-generated usernames from the old signup fallback (user_<8 hex chars>). */
const AUTO_USERNAME_PATTERN = /^user_[0-9a-f]{8}$/i;

/**
 * True when the user must complete the username onboarding step
 * before accessing the rest of the app.
 */
export function needsUsernameSetup(
  username: string | null | undefined
): boolean {
  if (!username || !username.trim()) return true;
  return AUTO_USERNAME_PATTERN.test(username.trim());
}
