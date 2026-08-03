"use server";

import { createClient } from "@/lib/supabaseServer";
import { isValidAvatarId, DEFAULT_AVATAR_ID } from "@/lib/avatars";
import { validateUsername } from "@/lib/username";

export type Profile = {
  id: string;
  username: string | null;
  avatar_id: string;
  email: string | null;
  role: string;
  created_at: string | null;
  updated_at: string | null;
};

/**
 * Source of truth for display names is `profiles.username` only.
 * Auth user_metadata is never used for display.
 */
export async function getMyProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_id, email, role, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!error && data) {
    return {
      id: data.id,
      username: data.username ?? null,
      avatar_id: data.avatar_id ?? DEFAULT_AVATAR_ID,
      email: data.email ?? user.email ?? null,
      role: data.role ?? "user",
      created_at: data.created_at ?? null,
      updated_at: data.updated_at ?? null,
    };
  }

  // No profile row yet — authenticated shell only (onboarding will create/fill).
  return {
    id: user.id,
    username: null,
    avatar_id: DEFAULT_AVATAR_ID,
    email: user.email ?? null,
    role: "user",
    created_at: null,
    updated_at: null,
  };
}

export async function updateProfile(params: {
  username?: string;
  avatar_id?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (params.username !== undefined) {
    const usernameError = validateUsername(params.username);
    if (usernameError) return { success: false, error: usernameError };

    const trimmed = params.username.trim();
    const { data: available, error: rpcError } = await supabase.rpc(
      "is_username_available",
      { desired: trimmed }
    );

    if (rpcError) {
      return {
        success: false,
        error: "Could not verify username availability. Try again.",
      };
    }

    if (available === false) {
      return { success: false, error: "Username is already taken." };
    }

    updates.username = trimmed;
    // Keep full_name aligned with username (never Google given/family name).
    updates.full_name = trimmed;
  }

  if (params.avatar_id !== undefined) {
    if (!isValidAvatarId(params.avatar_id)) {
      return { success: false, error: "Invalid avatar selection." };
    }
    updates.avatar_id = params.avatar_id;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505" || error.message?.includes("unique")) {
      return { success: false, error: "Username is already taken." };
    }
    return { success: false, error: "Failed to update profile." };
  }

  return { success: true };
}

export async function checkUsernameAvailabilityForEdit(
  username: string
): Promise<{ available: boolean; error?: string }> {
  const trimmed = username.trim();
  const validationError = validateUsername(trimmed);
  if (validationError) return { available: false, error: validationError };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_username_available", {
    desired: trimmed,
  });

  if (error) {
    return {
      available: false,
      error: "Could not verify username availability. Try again.",
    };
  }

  return { available: data === true };
}
