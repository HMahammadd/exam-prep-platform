import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { createClient as createSessionClient } from "@/lib/supabaseServer";

/**
 * Service-role Supabase client. Bypasses Row Level Security, so it must ONLY be
 * used from server-side code (Server Actions / Route Handlers) AFTER the caller
 * has been authenticated and authorized. Never import this from a Client
 * Component or expose the key to the browser.
 *
 * Used for privileged operations that clients must not be able to forge:
 *   - reading answer keys during grading
 *   - writing exam scores / attempt rows
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient must never be called in the browser.");
  }

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing service-role configuration. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your server environment."
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Client used for grading / score writes. Prefers the service role; if
 * SUPABASE_SERVICE_ROLE_KEY is not configured yet, falls back to the user's
 * session client so the app keeps working before the security migration
 * (004_security_hardening.sql) is applied.
 *
 * NOTE: the fallback only works while clients are still allowed to insert
 * attempt rows. Once migration 004 is run, you MUST set
 * SUPABASE_SERVICE_ROLE_KEY or grading will fail.
 */
export async function createGradingClient(): Promise<SupabaseClient> {
  if (typeof window !== "undefined") {
    throw new Error("createGradingClient must never be called in the browser.");
  }

  if (supabaseUrl && serviceRoleKey) {
    return createAdminClient();
  }

  console.warn(
    "[security] SUPABASE_SERVICE_ROLE_KEY is not set — grading is using the user session client. " +
      "Add the service_role key to your server environment and run supabase/migrations/004_security_hardening.sql."
  );

  return createSessionClient();
}
