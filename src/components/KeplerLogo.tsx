"use client";

import Image from "next/image";
import { LocaleLink } from "./LocaleLink";
import { useTranslations } from "./I18nProvider";

type KeplerLogoProps = {
  /** Where the logo navigates. Defaults to the public home page. */
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

/** Shared icon box — identical in light and dark so both planets match. */
const MARK_CLASS = {
  sm: "h-9 w-9 sm:h-10 sm:w-10",
  md: "h-11 w-11 sm:h-12 sm:w-12",
  lg: "h-12 w-12 sm:h-14 sm:w-14",
} as const;

const WORDMARK_CLASS = {
  sm: "text-lg sm:text-xl",
  md: "text-xl sm:text-2xl",
  lg: "text-2xl sm:text-[1.75rem]",
} as const;

/**
 * Official Keplerly logo — one shared layout for both themes.
 * Only the planet asset switches; the wordmark stays visible and uses
 * `text-foreground` so it follows the existing light/dark theme.
 */
export function KeplerLogo({
  href = "/",
  size = "md",
  className = "",
}: KeplerLogoProps) {
  const t = useTranslations();
  const markClass = MARK_CLASS[size];
  const wordmarkClass = WORDMARK_CLASS[size];
  const ariaLabel =
    href === "/dashboard" ? t("nav.logoDashboard") : t("nav.logoHome");

  return (
    <LocaleLink
      href={href}
      aria-label={ariaLabel}
      className={`group inline-flex shrink-0 items-center gap-2 transition-opacity duration-200 hover:opacity-90 sm:gap-2.5 ${className}`}
    >
      <Image
        src="/brand/kepler-mark.png"
        alt=""
        width={432}
        height={432}
        priority
        className={`kepler-logo-mark ${markClass} object-contain dark:hidden`}
      />
      <Image
        src="/brand/keplerly-dark-logo.png"
        alt=""
        width={279}
        height={279}
        className={`kepler-logo-mark ${markClass} hidden object-contain dark:block`}
      />
      <span
        className={`font-heading ${wordmarkClass} font-semibold leading-none tracking-tight text-foreground`}
      >
        Keplerly
      </span>
    </LocaleLink>
  );
}
