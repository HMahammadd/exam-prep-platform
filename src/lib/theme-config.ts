/**
 * Single source of truth for the appearance selector.
 *
 * Two independent axes:
 *   appearanceMode — "day" | "night". Still rides the existing `.dark` class,
 *     so every rule already written against `.dark` keeps working untouched.
 *   colorTheme     — one of four two-colour palettes. Sets `data-theme` on
 *     <html> and overrides only the token block in globals.css.
 *
 * All 4 x 2 = 8 combinations are defined; neither axis resets the other.
 */

export type Appearance = "day" | "night";

export type ColorTheme =
  | "charcoal-coral"
  | "royal-blush"
  | "deep-blue-sky"
  | "crimson-ivory";

export type ThemeSwatch = {
  id: ColorTheme;
  /** i18n key for the visible name. */
  labelKey: string;
  /** The two palette colours — rendered as a hard 50/50 split, never a blend. */
  primary: string;
  secondary: string;
};

export const APPEARANCES: { id: Appearance; labelKey: string }[] = [
  { id: "day", labelKey: "theme.day" },
  { id: "night", labelKey: "theme.night" },
];

export const COLOR_THEMES: ThemeSwatch[] = [
  {
    id: "charcoal-coral",
    labelKey: "theme.colorCharcoalCoral",
    primary: "#212B3A",
    secondary: "#FBA580",
  },
  {
    id: "royal-blush",
    labelKey: "theme.colorRoyalBlush",
    primary: "#2F3C7E",
    secondary: "#FBEAEB",
  },
  {
    id: "deep-blue-sky",
    labelKey: "theme.colorDeepBlueSky",
    primary: "#00246B",
    secondary: "#CADCFC",
  },
  {
    id: "crimson-ivory",
    labelKey: "theme.colorCrimsonIvory",
    primary: "#990011",
    secondary: "#FCF6F5",
  },
];

export const DEFAULT_APPEARANCE: Appearance = "day";
/** Closest to the pre-existing brand blue, so nothing jumps on first load. */
export const DEFAULT_COLOR_THEME: ColorTheme = "deep-blue-sky";

export const APPEARANCE_STORAGE_KEY = "theme";
export const COLOR_THEME_STORAGE_KEY = "color-theme";

export function isAppearance(value: unknown): value is Appearance {
  return value === "day" || value === "night";
}

export function isColorTheme(value: unknown): value is ColorTheme {
  return COLOR_THEMES.some((theme) => theme.id === value);
}

/** Accepts the pre-Day/Night values so a returning visitor keeps their mode. */
export function normalizeAppearance(value: unknown): Appearance {
  if (isAppearance(value)) return value;
  if (value === "dark") return "night";
  if (value === "light" || value === "system") return "day";
  return DEFAULT_APPEARANCE;
}

/** Old palette ids (default/blue/orange/navy) fall back to the default. */
export function normalizeColorTheme(value: unknown): ColorTheme {
  return isColorTheme(value) ? value : DEFAULT_COLOR_THEME;
}
