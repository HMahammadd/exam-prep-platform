export const locales = ["en", "az", "ru"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export const localeNames: Record<Locale, string> = {
  en: "English",
  az: "Azərbaycan",
  ru: "Русский",
};

export const localeShort: Record<Locale, string> = {
  en: "EN",
  az: "AZ",
  ru: "RU",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return locales.includes(value as Locale);
}

/** Split `/az/login` → `{ locale: "az", pathname: "/login" }` */
export function parseLocalePath(pathname: string): {
  locale: Locale | null;
  pathname: string;
} {
  const parts = pathname.split("/");
  const maybe = parts[1];
  if (isLocale(maybe)) {
    const rest = `/${parts.slice(2).join("/")}`.replace(/\/$/, "") || "/";
    return { locale: maybe, pathname: rest };
  }
  return { locale: null, pathname: pathname || "/" };
}

export function withLocale(pathname: string, locale: Locale): string {
  const clean =
    pathname === "/"
      ? "/"
      : pathname.startsWith("/")
        ? pathname
        : `/${pathname}`;
  if (clean === "/") return `/${locale}`;
  return `/${locale}${clean}`;
}

/** Paths that must never receive a locale prefix (OAuth, APIs). */
export function isLocaleExemptPath(pathname: string): boolean {
  return (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/monitoring")
  );
}

export function detectLocaleFromHeader(
  acceptLanguage: string | null
): Locale {
  if (!acceptLanguage) return defaultLocale;
  const lowered = acceptLanguage.toLowerCase();
  if (lowered.includes("az")) return "az";
  if (lowered.includes("ru")) return "ru";
  if (lowered.includes("en")) return "en";
  return defaultLocale;
}
