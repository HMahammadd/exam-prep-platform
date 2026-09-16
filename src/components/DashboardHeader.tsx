"use client";

"use client";

import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { AccountButton } from "./AccountButton";
import { AdminHeaderLink } from "./AdminHeaderLink";
import { KeplerLogo } from "./KeplerLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LocaleLink } from "./LocaleLink";
import { ThemeToggle } from "./ThemeToggle";

type DashboardHeaderProps = {
  title?: string;
  backHref?: string;
  backLabel?: string;
};

export function DashboardHeader({
  title = "Dashboard",
  backHref,
  backLabel = "Dashboard",
}: DashboardHeaderProps) {
  return (
    <header className="site-header">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <KeplerLogo href="/dashboard" />

          <span className="h-5 w-px shrink-0 bg-card-border" aria-hidden />

          <LocaleLink
            href="/dashboard"
            className="truncate text-lg font-semibold text-foreground transition hover:text-accent"
          >
            {title}
          </LocaleLink>

          {backHref && (
            <LocaleLink
              href={backHref}
              className="hidden items-center gap-1 text-sm font-medium text-muted transition hover:text-foreground sm:inline-flex"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {backLabel}
            </LocaleLink>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <AdminHeaderLink />
          <LanguageSwitcher />
          <ThemeToggle />
          <Suspense
            fallback={
              <div
                className="h-10 w-28 animate-pulse rounded-lg bg-card-border/70"
                aria-hidden
              />
            }
          >
            <AccountButton />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
