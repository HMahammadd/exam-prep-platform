"use client";

import { Check, ChevronDown, Languages } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import {
  localeNames,
  locales,
  localeShort,
  LOCALE_COOKIE,
  parseLocalePath,
  withLocale,
  type Locale,
} from "@/lib/i18n/config";

type LanguageSwitcherProps = {
  /** Icon-only trigger, e.g. for the collapsed sidebar rail. */
  compact?: boolean;
};

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const switchLocale = (next: Locale) => {
    setOpen(false);
    if (next === locale) return;

    const { pathname: bare } = parseLocalePath(pathname);
    const targetPath = withLocale(bare, next);
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
    router.push(targetPath);
    router.refresh();
  };

  return (
    <div className="language-switcher" ref={rootRef}>
      <button
        type="button"
        className={`language-switcher-trigger${compact ? " is-compact" : ""}`}
        aria-label={t("language.select")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
      >
        <Languages className="h-4 w-4 shrink-0 text-accent" aria-hidden />
        {!compact ? (
          <>
            <span className="language-switcher-code">
              {localeShort[locale]}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 opacity-70 transition ${
                open ? "rotate-180" : ""
              }`}
              aria-hidden
            />
          </>
        ) : null}
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={t("language.select")}
          className="language-switcher-menu"
        >
          {locales.map((item) => {
            const active = item === locale;
            return (
              <li key={item} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`language-switcher-option ${
                    active ? "is-active" : ""
                  }`}
                  onClick={() => switchLocale(item)}
                >
                  <span>{localeNames[item]}</span>
                  {active ? (
                    <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
