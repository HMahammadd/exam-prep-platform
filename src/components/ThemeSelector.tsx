"use client";

import { Check, Moon, Sun } from "lucide-react";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { useTranslations } from "@/components/I18nProvider";
import { useTheme } from "@/components/ThemeProvider";
import {
  APPEARANCES,
  COLOR_THEMES,
  type Appearance,
} from "@/lib/theme-config";

const APPEARANCE_ICON = {
  day: Sun,
  night: Moon,
} as const;

type ThemeSelectorProps = {
  /** `nav` sits inside the liquid-glass pill; `chip` is the standalone button. */
  variant?: "chip" | "nav";
};

export function ThemeSelector({ variant = "chip" }: ThemeSelectorProps) {
  const t = useTranslations();
  const { theme, appearance, setAppearance, colorTheme, setColorTheme } =
    useTheme();

  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const isDark = theme === "dark";
  const isNav = variant === "nav";

  // Outside click + Escape.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled])'
      );
      if (!focusables?.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Move focus into the panel once it opens.
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      panelRef.current
        ?.querySelector<HTMLElement>("button[aria-checked='true']")
        ?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const chooseAppearance = (next: Appearance) => setAppearance(next);

  return (
    <div className="theme-selector" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={
          isNav
            ? "liquid-nav-theme theme-toggle"
            : "theme-toggle glass-chip inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-sm font-medium text-foreground"
        }
        aria-label={t("theme.appearance")}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span
          className={`theme-toggle-icon relative grid h-4 w-4 place-items-center overflow-visible ${
            isNav ? "text-foreground" : "text-accent"
          }`}
        >
          <span
            className={`theme-toggle-face theme-toggle-face--sun col-start-1 row-start-1 ${
              isDark ? "is-hidden" : "is-active"
            }`}
          >
            <Sun className="h-4 w-4" aria-hidden />
          </span>
          <span
            className={`theme-toggle-face theme-toggle-face--moon col-start-1 row-start-1 ${
              isDark ? "is-active" : "is-hidden"
            }`}
          >
            <Moon className="h-4 w-4" aria-hidden />
          </span>
        </span>
        {!isNav ? (
          <span className="hidden sm:inline">{t("theme.appearance")}</span>
        ) : null}
      </button>

      <div
        className={`theme-panel-scrim${open ? " is-open" : ""}`}
        aria-hidden
        onClick={() => setOpen(false)}
      />

      <div
        id={panelId}
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-label={t("theme.appearance")}
        className={`theme-panel${open ? " is-open" : ""}`}
        inert={open ? undefined : true}
      >
        <div className="theme-panel-grabber" aria-hidden />

        <section className="theme-panel-section">
          <h3 className="theme-panel-title">{t("theme.appearance")}</h3>
          <div className="theme-appearance-row" role="radiogroup">
            {APPEARANCES.map(({ id, labelKey }) => {
              const Icon = APPEARANCE_ICON[id];
              const active = appearance === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`theme-appearance-btn${active ? " is-active" : ""}`}
                  onClick={() => chooseAppearance(id)}
                >
                  <Icon className="h-[1.15rem] w-[1.15rem]" aria-hidden />
                  <span>{t(labelKey)}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="theme-panel-divider" aria-hidden />

        <section className="theme-panel-section">
          <h3 className="theme-panel-title">{t("theme.colorTheme")}</h3>
          <div className="theme-color-grid" role="radiogroup">
            {COLOR_THEMES.map(({ id, labelKey, primary, secondary }) => {
              const active = colorTheme === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`theme-color-card${active ? " is-active" : ""}`}
                  onClick={() => setColorTheme(id)}
                  title={`${t(labelKey)} — ${primary} / ${secondary}`}
                  style={
                    {
                      "--swatch-a": primary,
                      "--swatch-b": secondary,
                    } as CSSProperties
                  }
                >
                  <span className="theme-color-swatch" aria-hidden>
                    <span className="theme-color-check">
                      <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                    </span>
                  </span>
                  <span className="theme-color-name">{t(labelKey)}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
