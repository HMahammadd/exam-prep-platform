"use client";

import { UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { KeplerLogo } from "./KeplerLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LiquidNavPill } from "./LiquidNavPill";
import { LocaleLink } from "./LocaleLink";
import { LogInIcon } from "./LogInIcon";
import { MobileNavMenu } from "./MobileNavMenu";
import { useTranslations } from "./I18nProvider";

export function Navbar() {
  const t = useTranslations();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 18);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`site-header sticky top-0 z-50${scrolled ? " is-scrolled" : ""}`}
    >
      <div className="site-header-inner">
        <div className="site-header-brand">
          <KeplerLogo size="md" />
        </div>

        <div className="site-header-nav">
          <LiquidNavPill />
        </div>

        <div className="site-header-actions">
          <LanguageSwitcher />
          <LocaleLink
            href="/login"
            className="site-header-login group/login"
          >
            <LogInIcon className="h-4 w-4 shrink-0" />
            <span>{t("nav.login")}</span>
          </LocaleLink>
          <LocaleLink href="/signup" className="site-header-signup">
            <UserPlus className="h-4 w-4" aria-hidden />
            <span className="whitespace-nowrap">{t("nav.signup")}</span>
          </LocaleLink>
          <MobileNavMenu />
        </div>
      </div>
    </header>
  );
}
