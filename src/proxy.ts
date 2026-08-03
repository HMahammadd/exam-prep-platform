import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { needsUsernameSetup } from "@/lib/username-setup";

const PROTECTED_PREFIXES = ["/dashboard", "/practice", "/admin"];
const ONBOARDING_PATH = "/onboarding/username";

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isOnboardingPath(pathname: string): boolean {
  return (
    pathname === ONBOARDING_PATH || pathname.startsWith(`${ONBOARDING_PATH}/`)
  );
}

/**
 * Next.js 16 Proxy (formerly middleware).
 * - Forwards misplaced OAuth `code` params to /auth/callback
 * - Refreshes the auth session cookies
 * - Blocks the app until the user has chosen a username
 */
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const code = searchParams.get("code");

  // OAuth / PKCE codes that land on / (Site URL) must be exchanged at /auth/callback.
  if (code && !pathname.startsWith("/auth/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    if (!url.searchParams.get("next")) {
      url.searchParams.set("next", "/dashboard");
    }
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const shouldCheckUsername =
    Boolean(user) && (isProtectedPath(pathname) || isOnboardingPath(pathname));

  if (shouldCheckUsername && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

    const needsSetup = needsUsernameSetup(profile?.username);

    if (needsSetup && isProtectedPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = ONBOARDING_PATH;
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (!needsSetup && isOnboardingPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and image optimization.
     */
    "/((?!_next/static|_next/image|favicon.ico|brand/|avatars/|monitoring|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
