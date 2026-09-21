"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  APPEARANCE_STORAGE_KEY,
  COLOR_THEME_STORAGE_KEY,
  DEFAULT_APPEARANCE,
  DEFAULT_COLOR_THEME,
  normalizeAppearance,
  normalizeColorTheme,
  type Appearance,
  type ColorTheme,
} from "@/lib/theme-config";

type Theme = "light" | "dark";

type ThemeContextValue = {
  /** Resolved appearance — "night" collapsed onto the existing `.dark` class. */
  theme: Theme;
  toggleTheme: () => void;
  appearance: Appearance;
  setAppearance: (next: Appearance) => void;
  colorTheme: ColorTheme;
  setColorTheme: (next: ColorTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},
  appearance: DEFAULT_APPEARANCE,
  setAppearance: () => {},
  colorTheme: DEFAULT_COLOR_THEME,
  setColorTheme: () => {},
});

function resolveAppearance(appearance: Appearance): Theme {
  return appearance === "night" ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function applyColorTheme(colorTheme: ColorTheme) {
  document.documentElement.setAttribute("data-theme", colorTheme);
}

/**
 * Colour tokens are only transitioned during an actual switch. Leaving the
 * transition on permanently would make every hover and scroll effect that
 * touches a token animate at 400ms.
 */
function withColorTransition(apply: () => void) {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  apply();
  window.setTimeout(() => root.classList.remove("theme-transition"), 460);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [appearance, setAppearanceState] =
    useState<Appearance>(DEFAULT_APPEARANCE);
  const [theme, setTheme] = useState<Theme>("light");
  const [colorTheme, setColorThemeState] =
    useState<ColorTheme>(DEFAULT_COLOR_THEME);

  useEffect(() => {
    const storedAppearance = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    const storedColor = localStorage.getItem(COLOR_THEME_STORAGE_KEY);

    // normalize* also migrates the pre-Day/Night values (light/dark/system)
    // and the retired palette ids, so an existing visitor keeps their mode.
    const initialAppearance = normalizeAppearance(storedAppearance);
    const initialColor = normalizeColorTheme(storedColor);

    setAppearanceState(initialAppearance);
    setColorThemeState(initialColor);

    const resolved = resolveAppearance(initialAppearance);
    setTheme(resolved);
    applyTheme(resolved);
    applyColorTheme(initialColor);
  }, []);

  const setAppearance = useCallback((next: Appearance) => {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, next);
    const resolved = resolveAppearance(next);
    withColorTransition(() => {
      setAppearanceState(next);
      setTheme(resolved);
      applyTheme(resolved);
    });
  }, []);

  const setColorTheme = useCallback((next: ColorTheme) => {
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, next);
    withColorTransition(() => {
      setColorThemeState(next);
      applyColorTheme(next);
    });
  }, []);

  /** Preserved for the existing nav/auth/dashboard toggles. */
  const toggleTheme = useCallback(() => {
    setAppearance(theme === "light" ? "night" : "day");
  }, [setAppearance, theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        appearance,
        setAppearance,
        colorTheme,
        setColorTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
