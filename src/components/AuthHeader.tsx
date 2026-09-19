"use client";

import { KeplerLogo } from "./KeplerLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSelector } from "./ThemeSelector";

export function AuthHeader() {
  return (
    <header className="site-header">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-4">
        <KeplerLogo />
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <ThemeSelector />
        </div>
      </div>
    </header>
  );
}
