import { type NextRequest, NextResponse } from "next/server";
import {
  createRouteHandlerClient,
  safeNextPath,
} from "@/lib/supabaseRouteHandler";
import { needsUsernameSetup } from "@/lib/username-setup";

/**
 * Exchanges the auth `code` from OAuth / email redirects for a session.
 * Users without a chosen username are sent to onboarding first.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"), "/dashboard");
  const errorRedirect = new URL("/login", origin);
  errorRedirect.searchParams.set("error", "auth");

  if (searchParams.get("error")) {
    return NextResponse.redirect(errorRedirect);
  }

  if (!code) {
    return NextResponse.redirect(errorRedirect);
  }

  const response = NextResponse.redirect(
    buildRedirectUrl(request, origin, next)
  );
  const supabase = createRouteHandlerClient(request, response);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(errorRedirect);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

    if (needsUsernameSetup(profile?.username)) {
      // Keep session cookies; only change where we send the browser.
      response.headers.set(
        "Location",
        buildRedirectUrl(request, origin, "/onboarding/username").toString()
      );
    }
  }

  return response;
}

function buildRedirectUrl(request: NextRequest, origin: string, next: string) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (isLocalEnv || !forwardedHost) {
    return new URL(next, origin);
  }

  return new URL(next, `https://${forwardedHost}`);
}
