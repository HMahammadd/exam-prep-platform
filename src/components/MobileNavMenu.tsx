"use client";

import { Menu, UserPlus, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useI18n, useTranslations } from "@/components/I18nProvider";
import { LocaleLink } from "@/components/LocaleLink";
import { LogInIcon } from "@/components/LogInIcon";
import { NAV_ITEMS } from "@/components/navItems";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSectionNav } from "@/components/useSectionNav";
import {
  LOCALE_COOKIE,
  localeShort,
  locales,
  parseLocalePath,
  withLocale,
  type Locale,
} from "@/lib/i18n/config";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileNavMenu() {
  const t = useTranslations();
  const { locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { activeId, navigateToSection } = useSectionNav();

  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  const handleNavClick = (id: (typeof NAV_ITEMS)[number]["id"]) => {
    close();
    window.setTimeout(() => navigateToSection(id), 220);
  };

  const switchLocale = (next: Locale) => {
    if (next === locale) return;
    const { pathname: bare } = parseLocalePath(pathname);
    const targetPath = withLocale(bare, next);
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
    router.push(targetPath);
    router.refresh();
  };

  // Lock body scroll while open, without moving the scroll position.
  useEffect(() => {
    if (!open) return;
    const { style } = document.body;
    const prevOverflow = style.overflow;
    style.overflow = "hidden";
    return () => {
      style.overflow = prevOverflow;
    };
  }, [open]);

  // Escape closes; basic focus trap while open.
  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const focusables = panel
      ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      : [];
    focusables[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        buttonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || focusables.length === 0) return;

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

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="mobile-nav-trigger"
        aria-label={open ? t("nav.closeMenu") : t("nav.menu")}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="mobile-nav-trigger-icon" aria-hidden>
          <Menu className={`mobile-nav-icon mobile-nav-icon--menu${open ? " is-hidden" : ""}`} />
          <X className={`mobile-nav-icon mobile-nav-icon--close${open ? " is-visible" : ""}`} />
        </span>
      </button>

      <div
        id={panelId}
        ref={panelRef}
        className={`mobile-nav-overlay${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.menu")}
        inert={open ? undefined : true}
      >
        <button
          type="button"
          className="mobile-nav-scrim"
          aria-hidden
          tabIndex={-1}
          onClick={close}
        />

        <nav className="mobile-nav-panel" aria-label="Primary">
          <ul className="mobile-nav-list">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeId === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={
                      item.href.startsWith("/#")
                        ? `${withLocale("/", locale)}#${item.href.slice(2)}`
                        : withLocale(item.href, locale)
                    }
                    className={`mobile-nav-item${isActive ? " is-active" : ""}`}
                    aria-current={isActive ? "true" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      handleNavClick(item.id);
                    }}
                  >
                    <Icon className="mobile-nav-item-icon" aria-hidden />
                    <span>{t(item.labelKey)}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="mobile-nav-divider" aria-hidden />

          <div className="mobile-nav-utility">
            <span className="mobile-nav-utility-label">{t("nav.language")}</span>
            <div className="mobile-nav-locales">
              {locales.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`mobile-nav-locale${item === locale ? " is-active" : ""}`}
                  onClick={() => switchLocale(item)}
                  aria-current={item === locale ? "true" : undefined}
                >
                  {localeShort[item]}
                </button>
              ))}
            </div>
          </div>

          <div className="mobile-nav-utility">
            <span className="mobile-nav-utility-label">{t("nav.theme")}</span>
            <ThemeToggle variant="chip" />
          </div>

          <div className="mobile-nav-divider" aria-hidden />

          <div className="mobile-nav-auth">
            <LocaleLink href="/login" className="mobile-nav-login" onClick={close}>
              <LogInIcon className="h-4 w-4 shrink-0" />
              <span>{t("nav.login")}</span>
            </LocaleLink>
            <LocaleLink href="/signup" className="mobile-nav-signup" onClick={close}>
              <UserPlus className="h-4 w-4" aria-hidden />
              <span>{t("nav.signup")}</span>
            </LocaleLink>
          </div>
        </nav>
      </div>
    </>
  );
}
