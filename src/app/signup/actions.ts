"use server";

import { verifyTurnstileToken } from "@/lib/turnstile";

export type TurnstileCheckResult =
  | { success: true }
  | { success: false; error: string };

/** Server-side Turnstile check before client Supabase sign-up. */
export async function verifySignupTurnstile(
  turnstileToken: string
): Promise<TurnstileCheckResult> {
  const result = await verifyTurnstileToken(turnstileToken);

  if (result.ok) {
    return { success: true };
  }

  switch (result.code) {
    case "missing-token":
      return {
        success: false,
        error: "Complete the security check, then try again.",
      };
    case "missing-config":
      return {
        success: false,
        error: "Sign-up protection is not configured. Try again later.",
      };
    default:
      return {
        success: false,
        error:
          "Security check failed. Refresh the page, complete the check again, and retry.",
      };
  }
}
