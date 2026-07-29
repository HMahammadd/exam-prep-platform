/** Username rules shared by signup UI and validation. */
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

export function normalizeUsername(value: string): string {
  return value.trim();
}

export function validateUsername(value: string): string | null {
  const username = normalizeUsername(value);

  if (username.length < USERNAME_MIN) {
    return `Username must be at least ${USERNAME_MIN} characters.`;
  }
  if (username.length > USERNAME_MAX) {
    return `Username must be at most ${USERNAME_MAX} characters.`;
  }
  if (!USERNAME_PATTERN.test(username)) {
    return "Username can only use letters, numbers, and underscores.";
  }

  return null;
}

/** Nickname rules — allows periods in addition to username chars, 3–24 length. */
export const NICKNAME_MIN = 3;
export const NICKNAME_MAX = 24;
export const NICKNAME_PATTERN = /^[a-zA-Z0-9_.]{3,24}$/;

export function validateNickname(value: string): string | null {
  const nickname = value.trim();

  if (nickname.length < NICKNAME_MIN) {
    return `Nickname must be at least ${NICKNAME_MIN} characters.`;
  }
  if (nickname.length > NICKNAME_MAX) {
    return `Nickname must be at most ${NICKNAME_MAX} characters.`;
  }
  if (!NICKNAME_PATTERN.test(nickname)) {
    return "Nickname can only use letters, numbers, underscores, and periods.";
  }

  return null;
}
