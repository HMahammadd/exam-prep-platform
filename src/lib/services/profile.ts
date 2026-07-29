"use server";

import { createClient } from "@/lib/supabaseServer";
import { isValidAvatarId, DEFAULT_AVATAR_ID } from "@/lib/avatars";
import { validateNickname } from "@/lib/username";

export type Profile = {
  id: string;
  nickname: string;
  avatar_id: string;
  email: string | null;
  role: string;
  created_at: string | null;
  updated_at: string | null;
};

function fallbackNickname(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): string {
  const meta = user.user_metadata ?? {};
  if (typeof meta.username === "string" && meta.username.trim()) {
    return meta.username.trim();
  }
  if (typeof meta.full_name === "string" && meta.full_name.trim()) {
    return meta.full_name.trim().split(/\s+/)[0] ?? "user";
  }
  const emailLocal = user.email?.split("@")[0];
  if (emailLocal) return emailLocal.slice(0, 24);
  return `user_${user.id.slice(0, 8)}`;
}

export async function getMyProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Prefer social-feature columns; fall back if migration 006 is not applied yet.
  const withNickname = await supabase
    .from("profiles")
    .select("id, nickname, avatar_id, email, role, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!withNickname.error && withNickname.data) {
    return {
      id: withNickname.data.id,
      nickname: withNickname.data.nickname ?? fallbackNickname(user),
      avatar_id: withNickname.data.avatar_id ?? DEFAULT_AVATAR_ID,
      email: withNickname.data.email ?? user.email ?? null,
      role: withNickname.data.role ?? "user",
      created_at: withNickname.data.created_at ?? null,
      updated_at: withNickname.data.updated_at ?? null,
    };
  }

  // Column missing (PGRST204) or other schema mismatch — try legacy columns.
  const legacy = await supabase
    .from("profiles")
    .select("id, username, email, full_name, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!legacy.error && legacy.data) {
    return {
      id: legacy.data.id,
      nickname: legacy.data.username ?? fallbackNickname(user),
      avatar_id: DEFAULT_AVATAR_ID,
      email: legacy.data.email ?? user.email ?? null,
      role: legacy.data.role ?? "user",
      created_at: legacy.data.created_at ?? null,
      updated_at: null,
    };
  }

  // No profile row yet — still show account menu from auth metadata.
  return {
    id: user.id,
    nickname: fallbackNickname(user),
    avatar_id: DEFAULT_AVATAR_ID,
    email: user.email ?? null,
    role: "user",
    created_at: null,
    updated_at: null,
  };
}

export async function updateProfile(params: {
  nickname?: string;
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

  if (params.nickname !== undefined) {
    const nicknameError = validateNickname(params.nickname);
    if (nicknameError) return { success: false, error: nicknameError };

    const { data: available, error: rpcError } = await supabase.rpc(
      "check_nickname_available",
      { desired: params.nickname.trim() }
    );

    if (rpcError) {
      return {
        success: false,
        error:
          "Nickname checks are not available yet. Apply migration 006_social_features.sql in Supabase.",
      };
    }

    if (available === false) {
      return { success: false, error: "Nickname is already taken." };
    }

    updates.nickname = params.nickname.trim();
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
      return { success: false, error: "Nickname is already taken." };
    }
    if (error.message?.includes("nickname") || error.code === "PGRST204") {
      return {
        success: false,
        error:
          "Profile columns are missing. Apply migration 006_social_features.sql in Supabase.",
      };
    }
    return { success: false, error: "Failed to update profile." };
  }

  return { success: true };
}

export async function checkNicknameAvailability(
  nickname: string
): Promise<{ available: boolean; error?: string }> {
  const trimmed = nickname.trim();
  const validationError = validateNickname(trimmed);
  if (validationError) return { available: false, error: validationError };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_nickname_available", {
    desired: trimmed,
  });

  if (error) {
    return {
      available: false,
      error:
        "Nickname checks are not available yet. Apply migration 006_social_features.sql in Supabase.",
    };
  }

  return { available: data === true };
}
