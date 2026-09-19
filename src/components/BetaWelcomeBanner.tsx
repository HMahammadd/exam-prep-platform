"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "@/components/I18nProvider";

const DISMISS_KEY = "beta-welcome-dismissed";

/**
 * Shown once per browser on the dashboard. Dismissal is remembered, so it
 * never returns for that user on that device.
 */
export function BetaWelcomeBanner() {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      // Private mode / blocked storage — treat as not dismissed.
    }
    // Deliberate: the banner must not be in the SSR markup, or it would flash
    // for users who already dismissed it before the effect could hide it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(!dismissed);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Nothing to persist to — the banner simply returns next visit.
    }
  };

  return (
    <div className="beta-welcome" role="status">
      <span aria-hidden className="text-lg leading-none">
        🎉
      </span>
      <div>
        <p className="beta-welcome-title">{t("beta.welcomeTitle")}</p>
        <p className="beta-welcome-body">{t("beta.welcomeBody")}</p>
      </div>
      <button
        type="button"
        className="beta-welcome-close"
        onClick={dismiss}
        aria-label={t("beta.dismiss")}
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
