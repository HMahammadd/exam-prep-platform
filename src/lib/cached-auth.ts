import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabaseServer";
import { DEFAULT_AVATAR_ID } from "@/lib/avatars";
import type { Profile } from "@/lib/profile-types";

/**
 * Request-memoized auth user. Multiple RSC calls in one render share one getUser().
 */
export const getCachedUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Request-memoized profile row. Dedupes DashboardHeader + page profile reads.
 */
export const getCachedProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCachedUser();
  if (!user) return null;

  const supabase = await createClient();
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

  return {
    id: user.id,
    username: null,
    avatar_id: DEFAULT_AVATAR_ID,
    email: user.email ?? null,
    role: "user",
    created_at: null,
    updated_at: null,
  };
});
