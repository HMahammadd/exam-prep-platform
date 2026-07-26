"use client";

import Image from "next/image";
import Link from "next/link";

type KeplerLogoProps = {
  /** Where the logo navigates. Defaults to the public home page. */
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASS = {
  sm: "h-9 w-auto",
  md: "h-11 w-auto",
  lg: "h-14 w-auto",
} as const;

/**
 * Official Kepler mark — swaps light/dark assets with the document theme
 * (via the `dark` class on <html>), so the correct logo shows before JS hydrates.
 */
export function KeplerLogo({
  href = "/",
  size = "md",
  className = "",
}: KeplerLogoProps) {
  const sizeClass = SIZE_CLASS[size];

  const destinationLabel =
    href === "/dashboard" ? "go to dashboard" : "go to home page";

  return (
    <Link
      href={href}
      aria-label={`Kepler — ${destinationLabel}`}
      className={`group inline-flex shrink-0 items-center ${className}`}
    >
      {/* Light mode: dark-blue mark on light UI */}
      <Image
        src="/brand/kepler-light.png"
        alt=""
        width={274}
        height={320}
        priority
        className={`${sizeClass} object-contain transition-opacity duration-200 group-hover:opacity-90 dark:hidden`}
      />
      {/* Dark mode: white mark on dark UI */}
      <Image
        src="/brand/kepler-dark.png"
        alt=""
        width={274}
        height={320}
        priority
        className={`${sizeClass} hidden object-contain transition-opacity duration-200 group-hover:opacity-90 dark:block`}
      />
    </Link>
  );
}
