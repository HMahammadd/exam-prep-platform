import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Set it in your environment.`
    );
  }
  return value;
}

export function createClient() {
  const supabaseUrl = requireEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const supabasePublishableKey = requireEnv(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}

// Lazy singleton: importing this module must never throw (Next.js evaluates
// it during build-time page-data collection and SSR of every client
// component that imports it, even ones that never call `supabase.*`).
// The env check — and the one real client instance — is deferred until the
// first property access, which in practice only happens inside browser-only
// event handlers/effects, never during a synchronous render pass.
let cached: SupabaseClient | undefined;
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!cached) cached = createClient();
    return Reflect.get(cached, prop, cached);
  },
});
