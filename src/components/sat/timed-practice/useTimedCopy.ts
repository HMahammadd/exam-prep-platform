"use client";

import { useCallback } from "react";
import { useI18n } from "@/components/I18nProvider";

/**
 * The page's strings, scoped to the `timedPractice` namespace, plus plural
 * forms: `plural("questions", 5)` reads `timedPractice.questions.<category>`
 * using the locale's own plural rules (Russian has one/few/many), falling back
 * to `.other`.
 */
export function useTimedCopy() {
  const { t, locale } = useI18n();

  const tp = useCallback(
    (key: string, vars?: Record<string, string | number>) => t(`timedPractice.${key}`, vars),
    [t]
  );

  const plural = useCallback(
    (key: string, count: number) => {
      const exact = `timedPractice.${key}.${new Intl.PluralRules(locale).select(count)}`;
      const text = t(exact, { count });
      return text === exact ? t(`timedPractice.${key}.other`, { count }) : text;
    },
    [t, locale]
  );

  return { tp, plural, locale };
}
