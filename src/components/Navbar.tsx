"use client";

import { Home, Library, UserPlus } from "lucide-react";
import { KeplerLogo } from "./KeplerLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LocaleLink } from "./LocaleLink";
import { LogInIcon } from "./LogInIcon";
import { ThemeToggle } from "./ThemeToggle";
import { useTranslations } from "./I18nProvider";

export function Navbar() {
  const t = useTranslations();

  return (
    <header className="site-header sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <KeplerLogo />

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          <LocaleLink
            href="/"
            className="inline-flex items-center gap-1.5 transition hover:text-foreground"
          >
            <Home className="h-4 w-4" aria-hidden />
            {t("nav.home")}
          </LocaleLink>
          <LocaleLink
            href="/#exams"
            className="inline-flex items-center gap-1.5 transition hover:text-foreground"
          >
            <Library className="h-4 w-4" aria-hidden />
            {t("nav.exams")}
          </LocaleLink>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
          <LocaleLink
            href="/login"
            className="group/login hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition hover:bg-accent-soft sm:inline-flex"
          >
            <LogInIcon className="h-4 w-4 shrink-0" />
            {t("nav.login")}
          </LocaleLink>
          <LocaleLink
            href="/signup"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition hover:bg-accent-hover sm:px-4"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            <span className="whitespace-nowrap">{t("nav.signup")}</span>
          </LocaleLink>
        </div>
      </div>
    </header>
  );
}
