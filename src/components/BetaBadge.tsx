"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "@/components/I18nProvider";

type BetaBadgeProps = {
  /**
   * `hero` is the one prominent pill; `soft` is the quiet inline variant used
   * everywhere else. Only one `hero` should ever be in a viewport.
   */
  tone?: "hero" | "soft";
  /** Optional second line (hero only). */
  withSubline?: boolean;
  className?: string;
};

export function BetaBadge({
  tone = "soft",
  withSubline = false,
  className = "",
}: BetaBadgeProps) {
  const t = useTranslations();

  return (
    <span className={`beta-badge beta-badge--${tone} ${className}`.trim()}>
      <Sparkles className="beta-badge-icon" aria-hidden />
      <span className="beta-badge-label">{t("beta.badge")}</span>
      {withSubline ? (
        <span className="beta-badge-sub">{t("beta.heroSub")}</span>
      ) : null}
    </span>
  );
}
