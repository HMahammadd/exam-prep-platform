import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import {
  createRouteHandlerClient,
  safeNextPath,
} from "@/lib/supabaseRouteHandler";

/**
 * Handles email links that include token_hash (confirm signup, password recovery).
 * Recommended by Supabase for PKCE/SSR — does not require the original browser's
 * code verifier.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"), "/auth/reset-password");

  const redirectTo = new URL(next, origin);
  const errorRedirect = new URL("/forgot-password", origin);
  errorRedirect.searchParams.set("error", "auth");

  if (tokenHash && type) {
    const response = NextResponse.redirect(redirectTo);
    const supabase = createRouteHandlerClient(request, response);
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      return response;
    }
  }

  return NextResponse.redirect(errorRedirect);
}
