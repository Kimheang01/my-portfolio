import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/site-url";

// One entry per language, each listing the other languages as alternates.
export default function sitemap(): MetadataRoute.Sitemap {
  const urlFor = (locale: string) => new URL(`/${locale}`, siteUrl).href;
  const languages = Object.fromEntries(routing.locales.map((locale) => [locale, urlFor(locale)]));

  return routing.locales.map((locale) => ({
    url: urlFor(locale),
    alternates: { languages },
  }));
}
