"use client";

import { UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { KeplerLogo } from "./KeplerLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LiquidNavPill } from "./LiquidNavPill";
import { LocaleLink } from "./LocaleLink";
import { LogInIcon } from "./LogInIcon";
import { useTranslations } from "./I18nProvider";

export function Navbar() {
  const t = useTranslations();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 18);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <>
      <header
        className={`site-header sticky top-0 z-50${scrolled ? " is-scrolled" : ""}`}
      >
        <div className="site-header-inner">
          <div className="site-header-brand">
            <KeplerLogo size="md" />
          </div>

          {isMobile === false ? (
            <div className="site-header-nav">
              <LiquidNavPill />
            </div>
          ) : null}

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
          </div>
        </div>
      </header>

      {isMobile ? (
        <div className="liquid-nav-mobile-dock">
          <LiquidNavPill density="compact" className="liquid-nav--dock" />
        </div>
      ) : null}
    </>
  );
}
