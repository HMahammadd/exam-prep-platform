/**
 * Single source of truth for the theme selector.
 *
 * Appearance (light / dark / system) stays on the existing `.dark` class, so
 * every rule already written against `.dark` keeps working untouched. A colour
 * theme is a separate axis: it sets `data-theme` on <html> and overrides only
 * the accent tokens, which the rest of globals.css already reads. Adding a
 * theme means adding one entry here plus one token block in globals.css.
 */

export type Appearance = "light" | "dark" | "system";
export type ColorTheme = "default" | "blue" | "orange" | "navy";

export type ThemeSwatch = {
  id: ColorTheme;
  /** i18n key for the visible name. */
  labelKey: string;
  /** Shown on the card; the colour this theme is recognised by. */
  hex: string;
  /** Card gradient stops — purely decorative. */
  preview: [string, string];
};

export const APPEARANCES: { id: Appearance; labelKey: string }[] = [
  { id: "light", labelKey: "theme.light" },
  { id: "dark", labelKey: "theme.dark" },
  { id: "system", labelKey: "theme.system" },
];

export const COLOR_THEMES: ThemeSwatch[] = [
  {
    id: "default",
    labelKey: "theme.colorDefault",
    hex: "#2563EB",
    preview: ["#F9F9F9", "#2563EB"],
  },
  {
    id: "blue",
    labelKey: "theme.colorBlue",
    hex: "#004E72",
    preview: ["#004E72", "#4EA1D3"],
  },
  {
    id: "orange",
    labelKey: "theme.colorOrange",
    hex: "#FF6E42",
    preview: ["#FF6E42", "#FFC58F"],
  },
  {
    id: "navy",
    labelKey: "theme.colorNavy",
    hex: "#092634",
    preview: ["#092634", "#2A6F8F"],
  },
];

export const APPEARANCE_STORAGE_KEY = "theme";
export const COLOR_THEME_STORAGE_KEY = "color-theme";

export function isAppearance(value: unknown): value is Appearance {
  return value === "light" || value === "dark" || value === "system";
}

export function isColorTheme(value: unknown): value is ColorTheme {
  return COLOR_THEMES.some((theme) => theme.id === value);
}
