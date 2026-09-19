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
  isAppearance,
  isColorTheme,
  type Appearance,
  type ColorTheme,
} from "@/lib/theme-config";

type Theme = "light" | "dark";

type ThemeContextValue = {
  /** Resolved appearance — "system" already collapsed to light or dark. */
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
  appearance: "light",
  setAppearance: () => {},
  colorTheme: "default",
  setColorTheme: () => {},
});

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveAppearance(appearance: Appearance): Theme {
  if (appearance === "system") {
    return systemPrefersDark() ? "dark" : "light";
  }
  return appearance;
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function applyColorTheme(colorTheme: ColorTheme) {
  const root = document.documentElement;
  if (colorTheme === "default") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", colorTheme);
  }
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
  const [appearance, setAppearanceState] = useState<Appearance>("light");
  const [theme, setTheme] = useState<Theme>("light");
  const [colorTheme, setColorThemeState] = useState<ColorTheme>("default");

  useEffect(() => {
    const storedAppearance = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    const storedColor = localStorage.getItem(COLOR_THEME_STORAGE_KEY);

    const initialAppearance: Appearance = isAppearance(storedAppearance)
      ? storedAppearance
      : "light";
    const initialColor: ColorTheme = isColorTheme(storedColor)
      ? storedColor
      : "default";

    setAppearanceState(initialAppearance);
    setColorThemeState(initialColor);

    const resolved = resolveAppearance(initialAppearance);
    setTheme(resolved);
    applyTheme(resolved);
    applyColorTheme(initialColor);
  }, []);

  // Follow the OS while (and only while) the user is on "system".
  useEffect(() => {
    if (appearance !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const resolved: Theme = media.matches ? "dark" : "light";
      withColorTransition(() => {
        setTheme(resolved);
        applyTheme(resolved);
      });
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [appearance]);

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
    setAppearance(theme === "light" ? "dark" : "light");
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
