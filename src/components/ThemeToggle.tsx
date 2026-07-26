"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to day mode" : "Switch to dark mode"}
      title={isDark ? "Day mode" : "Dark mode"}
      className="inline-flex items-center gap-2 rounded-lg border border-card-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-accent-soft dark:hover:bg-accent-soft/20"
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4 text-accent" aria-hidden />
          <span className="hidden sm:inline">Day</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-accent" aria-hidden />
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  );
}
