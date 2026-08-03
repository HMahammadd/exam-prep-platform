"use server";

import { createClient } from "@/lib/supabaseServer";
import { normalizeUsername, validateUsername } from "@/lib/username";

export type CompleteUsernameResult =
  | { success: true; username: string }
  | { success: false; error: string };

function mapRpcError(message: string | undefined): string {
  const code = message ?? "";
  if (code.includes("USERNAME_TAKEN")) {
    return "That username is already taken.";
  }
  if (code.includes("INVALID_USERNAME")) {
    return "Username can only use letters, numbers, and underscores (3–20 characters).";
  }
  if (code.includes("NOT_AUTHENTICATED")) {
    return "Your session expired. Refresh the page and try again.";
  }
  if (code.includes("PROFILE_NOT_FOUND")) {
    return "Profile not found. Sign out and sign in with Google again.";
  }
  if (code.includes("Could not find the function") || code.includes("PGRST202")) {
    return "Username setup is not ready yet. Apply migration 010_set_my_username_rpc.sql in Supabase.";
  }
  return "Failed to save username. Try again.";
}

/**
 * First-time username choice after Google (or other OAuth) signup.
 * Single round-trip: validate + availability + save via set_my_username RPC.
 */
export async function completeUsernameOnboarding(
  rawUsername: string
): Promise<CompleteUsernameResult> {
  const username = normalizeUsername(rawUsername);
  const formatError = validateUsername(username);
  if (formatError) {
    return { success: false, error: formatError };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "Your session expired. Refresh the page and try again.",
    };
  }

  const { error } = await supabase.rpc("set_my_username", {
    desired: username,
  });

  if (error) {
    return { success: false, error: mapRpcError(error.message) };
  }

  return { success: true, username };
}
