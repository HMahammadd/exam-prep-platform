import { cookies, headers } from "next/headers";
import {
  defaultLocale,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
} from "./config";

export async function getRequestLocale(): Promise<Locale> {
  const headerLocale = (await headers()).get("x-locale");
  if (isLocale(headerLocale)) return headerLocale;

  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  return defaultLocale;
}
