"use client";

import { useTheme } from "./ThemeProvider";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="12" cy="12" r="4.05" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.85" strokeLinecap="round">
        <path d="M12 2.55v2.2M12 19.25v2.2M2.55 12h2.2M19.25 12h2.2" />
        <path d="M5.18 5.18l1.56 1.56M17.26 17.26l1.56 1.56M18.82 5.18l-1.56 1.56M6.74 17.26l-1.56 1.56" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M12.85 3.2a9 9 0 1 0 8 14.35 7.2 7.2 0 0 1-8-14.35Z" />
      <path d="M18.12 3.7 18.72 5.32 20.34 5.92 18.72 6.52 18.12 8.14 17.52 6.52 15.9 5.92 17.52 5.32Z" />
      <path d="M21.28 8.48 21.62 9.4 22.54 9.74 21.62 10.08 21.28 11 20.94 10.08 20.02 9.74 20.94 9.4Z" />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to day mode" : "Switch to dark mode"}
      title={isDark ? "Day mode" : "Dark mode"}
      className="theme-toggle inline-flex h-9 items-center gap-1.5 rounded-lg border border-card-border bg-card px-2.5 text-sm font-medium text-foreground shadow-sm"
    >
      <span className="theme-toggle-icon relative grid h-4 w-4 place-items-center overflow-visible text-accent">
        <span
          className={`theme-toggle-face theme-toggle-face--sun col-start-1 row-start-1 ${
            isDark ? "is-hidden" : "is-active"
          }`}
        >
          <SunIcon />
        </span>
        <span
          className={`theme-toggle-face theme-toggle-face--moon col-start-1 row-start-1 ${
            isDark ? "is-active" : "is-hidden"
          }`}
        >
          <MoonIcon />
        </span>
      </span>
      <span className="hidden sm:inline">{isDark ? "Day" : "Dark"}</span>
    </button>
  );
}
