import type { Locale } from "./config";
import { defaultLocale } from "./config";
import en from "@/locales/en.json";
import az from "@/locales/az.json";
import ru from "@/locales/ru.json";

export type Messages = typeof en;

const catalogs: Record<Locale, Messages> = {
  en,
  az: az as Messages,
  ru: ru as Messages,
};

export function getMessages(locale: Locale): Messages {
  return catalogs[locale] ?? catalogs[defaultLocale];
}

type NestedValue = string | { [key: string]: NestedValue };

function getByPath(obj: NestedValue, path: string): string | undefined {
  const parts = path.split(".");
  let current: NestedValue | undefined = obj;
  for (const part of parts) {
    if (current == null || typeof current === "string") return undefined;
    current = current[part];
  }
  return typeof current === "string" ? current : undefined;
}

export function translate(
  messages: Messages,
  key: string,
  vars?: Record<string, string | number>
): string {
  const raw =
    getByPath(messages as unknown as NestedValue, key) ??
    getByPath(catalogs.en as unknown as NestedValue, key) ??
    key;

  if (!vars) return raw;
  return Object.entries(vars).reduce(
    (text, [name, value]) =>
      text.replace(new RegExp(`{{\\s*${name}\\s*}}`, "g"), String(value)),
    raw
  );
}
