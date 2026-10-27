import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { locale as localeParam } from "next/root-params";
import { routing, type Locale } from "./routing";

/** The language of the page being rendered, from the [locale] segment. */
export async function getLocale(): Promise<Locale> {
  const locale = await localeParam();
  if (!hasLocale(routing.locales, locale)) notFound();
  return locale;
}
