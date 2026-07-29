import { type NextRequest, NextResponse } from "next/server";
import {
  createRouteHandlerClient,
  safeNextPath,
} from "@/lib/supabaseRouteHandler";

/**
 * Exchanges the auth `code` from OAuth / email redirects for a session.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"), "/dashboard");
  const errorRedirect = new URL("/login", origin);
  errorRedirect.searchParams.set("error", "auth");

  if (code) {
    const redirectUrl = buildRedirectUrl(request, origin, next);
    const response = NextResponse.redirect(redirectUrl);
    const supabase = createRouteHandlerClient(request, response);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return response;
    }
  }

  return NextResponse.redirect(errorRedirect);
}

function buildRedirectUrl(request: NextRequest, origin: string, next: string) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (isLocalEnv || !forwardedHost) {
    return new URL(next, origin);
  }

  return new URL(next, `https://${forwardedHost}`);
}
