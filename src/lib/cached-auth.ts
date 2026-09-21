import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabaseServer";
import { DEFAULT_AVATAR_ID } from "@/lib/avatars";
import type { Profile } from "@/lib/profile-types";

/**
 * Request-memoized auth user.
 *
 * Backed by `getClaims()`, not `getUser()`. This project signs its JWTs with
 * asymmetric ES256 keys, so `getClaims()` verifies the token's signature
 * locally through WebCrypto against a cached JWKS — no call to the Auth
 * server. `getUser()` always went over the network, which measured ~460-670ms
 * per call from here and ran on every dashboard navigation (once in the proxy,
 * once again in the page), so it dominated the time to render a section.
 *
 * The identity is still cryptographically verified, which is what Supabase
 * recommends this method for. Claims carry everything the callers use (`id`
 * from `sub`, `email`); fields that only exist on the full Auth record are
 * filled from the claims where present and left null otherwise. Anything that
 * needs the authoritative row should query `profiles` (see getCachedProfile).
 */
export const getCachedUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  /* TEMPORARY PROFILING — dev only. */
  const started = performance.now();
  const { data, error } = await supabase.auth.getClaims();
  if (process.env.NODE_ENV === "development") {
    console.log(`[perf] getClaims ${(performance.now() - started).toFixed(0)}ms`);
  }

  if (error || !data?.claims?.sub) {
    return null;
  }

  const claims = data.claims;

  return {
    id: claims.sub,
    aud: Array.isArray(claims.aud) ? claims.aud[0] : (claims.aud ?? ""),
    role: claims.role,
    email: claims.email,
    phone: claims.phone,
    app_metadata: claims.app_metadata ?? {},
    user_metadata: claims.user_metadata ?? {},
    is_anonymous: claims.is_anonymous,
    created_at: "",
  } satisfies User as User;
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
