"use client";

import { BetaBadge } from "@/components/BetaBadge";
import { KeplerLogo } from "./KeplerLogo";
import { LocaleLink } from "./LocaleLink";
import { useTranslations } from "./I18nProvider";

export function SiteFooter() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  const groups = [
    {
      heading: t("footer.exams"),
      links: [
        { label: t("footer.satPractice"), href: "/dashboard/sat" },
        { label: t("footer.dimPractice"), href: "/dashboard/dim" },
        { label: t("footer.toefl"), href: "/dashboard/toefl" },
      ],
    },
    {
      heading: t("footer.account"),
      links: [
        { label: t("nav.login"), href: "/login" },
        { label: t("nav.signup"), href: "/signup" },
        { label: t("footer.dashboard"), href: "/dashboard" },
      ],
    },
  ];

  return (
    <footer className="site-footer">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <KeplerLogo />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            {t("footer.blurb")}
          </p>
        </div>

        {groups.map((group) => (
          <div key={group.heading}>
            <h3 className="text-sm font-semibold text-foreground">
              {group.heading}
            </h3>
            <ul className="mt-3 space-y-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <LocaleLink
                    href={link.href}
                    className="text-sm text-muted transition hover:text-accent"
                  >
                    {link.label}
                  </LocaleLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div>
        <div className="mx-auto max-w-6xl px-6 pt-5">
          <div className="beta-footer-note">
            <BetaBadge tone="soft" />
            <p className="beta-footer-body">{t("beta.footerBody")}</p>
          </div>
        </div>

        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-muted sm:flex-row">
          <p>{t("footer.rights", { year })}</p>
          <p>{t("footer.tagline")}</p>
        </div>
      </div>
    </footer>
  );
}
