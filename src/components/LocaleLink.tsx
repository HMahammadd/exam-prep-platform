"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useI18n } from "@/components/I18nProvider";
import { withLocale } from "@/lib/i18n/config";

type LocaleLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

/**
 * Link that keeps the active locale prefix in the URL bar
 * (e.g. /az/login instead of /login).
 */
export function LocaleLink({ href, ...props }: LocaleLinkProps) {
  const { locale } = useI18n();
  const localized =
    href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")
      ? href
      : href.startsWith("/#")
        ? `${withLocale("/", locale)}#${href.slice(2)}`
        : withLocale(href, locale);

  return <Link href={localized} {...props} />;
}
