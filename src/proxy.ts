import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import {
  defaultLocale,
  detectLocaleFromHeader,
  isLocale,
  isLocaleExemptPath,
  LOCALE_COOKIE,
  parseLocalePath,
  withLocale,
  type Locale,
} from "@/lib/i18n/config";
import { needsUsernameSetup } from "@/lib/username-setup";

const PROTECTED_PREFIXES = ["/dashboard", "/practice", "/admin"];
const ONBOARDING_PATH = "/onboarding/username";

/** Public marketing/auth UI — skip session refresh to keep TTFB low. */
const PUBLIC_FAST_PATHS = new Set([
  "/",
  "/login",
  "/signup",
  "/forgot-password",
]);

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

function needsAuthRefresh(pathname: string): boolean {
  if (PUBLIC_FAST_PATHS.has(pathname)) {
    return false;
  }
  return (
    isProtectedPath(pathname) ||
    isOnboardingPath(pathname) ||
    pathname.startsWith("/auth")
  );
}

/**
 * True for the RSC fetches Next makes during a client-side navigation or a
 * prefetch, as opposed to a document request.
 *
 * The username gate below costs a `profiles` round-trip on every protected
 * request, which is the bulk of the latency when moving between dashboard
 * sections. A client navigation can only happen after a document request that
 * already passed that gate, and a redirect returned to an RSC fetch cannot
 * drive the browser anyway — so the check is skipped here and still enforced
 * on every document load, deep link and refresh.
 */
function isClientNavigation(request: NextRequest): boolean {
  return request.headers.get("RSC") === "1";
}

function resolvePreferredLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;
  return detectLocaleFromHeader(request.headers.get("accept-language"));
}

function withLocaleCookie(response: NextResponse, locale: Locale) {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

/**
 * Next.js 16 Proxy (formerly middleware).
 * - Locale prefix routing (/en, /az, /ru)
 * - Forwards misplaced OAuth `code` params to /auth/callback
 * - Refreshes the auth session cookies
 * - Blocks the app until the user has chosen a username
 */
async function handleProxy(request: NextRequest) {
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

  // Keep OAuth / API routes free of locale prefixes.
  if (isLocaleExemptPath(pathname)) {
    // fall through to auth refresh logic below with original path
  } else {
    const parsed = parseLocalePath(pathname);

    if (!parsed.locale) {
      const preferred = resolvePreferredLocale(request);
      const url = request.nextUrl.clone();
      url.pathname = withLocale(pathname, preferred);
      return withLocaleCookie(NextResponse.redirect(url), preferred);
    }

    const locale = parsed.locale;
    const barePath = parsed.pathname;
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = barePath;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", locale);

    // Public pages: rewrite only (no auth work).
    if (!needsAuthRefresh(barePath)) {
      const response = NextResponse.rewrite(rewriteUrl, {
        request: { headers: requestHeaders },
      });
      return withLocaleCookie(response, locale);
    }

    // Protected / auth-adjacent: rewrite + session refresh on bare path.
    let supabaseResponse = NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders },
    });
    supabaseResponse = withLocaleCookie(supabaseResponse, locale);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      // Auth cannot be evaluated without Supabase configured. Let public pages
      // through, but never hand out a protected one unauthenticated.
      if (isProtectedPath(barePath)) {
        const url = request.nextUrl.clone();
        url.pathname = withLocale("/login", locale);
        url.search = "";
        return withLocaleCookie(NextResponse.redirect(url), locale);
      }
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
          supabaseResponse = NextResponse.rewrite(rewriteUrl, {
            request: { headers: requestHeaders },
          });
          supabaseResponse = withLocaleCookie(supabaseResponse, locale);
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    // getClaims() verifies the JWT locally (this project uses asymmetric ES256
    // keys) instead of calling the Auth server, which measured ~460-670ms per
    // request and ran on every single protected navigation. Identity is still
    // cryptographically verified, and an expiring session is still refreshed
    // through the cookie handlers above.
    /* TEMPORARY PROFILING — dev only. */
    const tClaims = performance.now();
    const { data: claims } = await supabase.auth.getClaims();
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[perf]   proxy.getClaims ${(performance.now() - tClaims).toFixed(0)}ms`
      );
    }
    const user = claims?.claims?.sub ? { id: claims.claims.sub } : null;

    // Fail closed: protected areas must never render for an anonymous caller,
    // even if a page below forgets its own guard.
    if (!user && isProtectedPath(barePath)) {
      const url = request.nextUrl.clone();
      url.pathname = withLocale("/login", locale);
      url.search = "";
      return withLocaleCookie(NextResponse.redirect(url), locale);
    }

    const shouldCheckUsername =
      Boolean(user) &&
      !isClientNavigation(request) &&
      (isProtectedPath(barePath) || isOnboardingPath(barePath));

    if (shouldCheckUsername && user) {
      /* TEMPORARY PROFILING — dev only. */
      const tProfile = performance.now();
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[perf]   proxy.profiles ${(performance.now() - tProfile).toFixed(0)}ms`
        );
      }

      const needsSetup = needsUsernameSetup(profile?.username);

      if (needsSetup && isProtectedPath(barePath)) {
        const url = request.nextUrl.clone();
        url.pathname = withLocale(ONBOARDING_PATH, locale);
        url.search = "";
        return withLocaleCookie(NextResponse.redirect(url), locale);
      }

      if (!needsSetup && isOnboardingPath(barePath)) {
        const url = request.nextUrl.clone();
        url.pathname = withLocale("/dashboard", locale);
        url.search = "";
        return withLocaleCookie(NextResponse.redirect(url), locale);
      }
    }

    return supabaseResponse;
  }

  // Locale-exempt paths (auth/api): original auth refresh behavior.
  if (!needsAuthRefresh(pathname)) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    if (isProtectedPath(pathname)) {
      const locale = resolvePreferredLocale(request);
      const url = request.nextUrl.clone();
      url.pathname = withLocale("/login", locale);
      url.search = "";
      return withLocaleCookie(NextResponse.redirect(url), locale);
    }
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

  const { data: claims } = await supabase.auth.getClaims();
  const user = claims?.claims?.sub ? { id: claims.claims.sub } : null;

  if (!user && isProtectedPath(pathname)) {
    const locale = resolvePreferredLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = withLocale("/login", locale);
    url.search = "";
    return withLocaleCookie(NextResponse.redirect(url), locale);
  }

  const shouldCheckUsername =
    Boolean(user) &&
    !isClientNavigation(request) &&
    (isProtectedPath(pathname) || isOnboardingPath(pathname));

  if (shouldCheckUsername && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

    const needsSetup = needsUsernameSetup(profile?.username);
    const locale = resolvePreferredLocale(request);

    if (needsSetup && isProtectedPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = withLocale(ONBOARDING_PATH, locale);
      url.search = "";
      return withLocaleCookie(NextResponse.redirect(url), locale);
    }

    if (!needsSetup && isOnboardingPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = withLocale("/dashboard", locale);
      url.search = "";
      return withLocaleCookie(NextResponse.redirect(url), locale);
    }
  }

  return supabaseResponse;
}

/* TEMPORARY PROFILING — dev only, remove once the slow path is identified. */
export async function proxy(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return handleProxy(request);
  }
  const started = performance.now();
  const response = await handleProxy(request);
  const ms = performance.now() - started;
  const { pathname } = request.nextUrl;
  if (pathname.includes("/dashboard")) {
    console.log(
      `[perf] proxy ${ms.toFixed(0).padStart(5)}ms  ` +
        `${request.headers.get("RSC") ? "RSC " : "DOC "}` +
        `${response.status}  ${pathname}`
    );
  }
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and image optimization.
     */
    "/((?!_next/static|_next/image|favicon.ico|brand/|avatars/|demo/|monitoring|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|ico|woff2?)$).*)",
  ],
};
