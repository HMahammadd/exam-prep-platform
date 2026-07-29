"use server";

import { createClient } from "@/lib/supabaseServer";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { normalizeUsername, validateUsername } from "@/lib/username";

export type TurnstileCheckResult =
  | { success: true }
  | { success: false; error: string };

export type UsernameCheckResult =
  | { success: true; username: string }
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

/** Validates format and checks uniqueness via `is_username_available` RPC. */
export async function checkUsernameAvailability(
  rawUsername: string
): Promise<UsernameCheckResult> {
  const username = normalizeUsername(rawUsername);
  const formatError = validateUsername(username);

  if (formatError) {
    return { success: false, error: formatError };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_username_available", {
    desired: username,
  });

  if (error) {
    // Migration may not be applied yet; allow signup and rely on DB constraints.
    if (error.code === "PGRST202" || error.message.includes("Could not find the function")) {
      return { success: true, username };
    }

    return {
      success: false,
      error: "Could not verify username availability. Try again.",
    };
  }

  if (data !== true) {
    return { success: false, error: "That username is already taken." };
  }

  return { success: true, username };
}
