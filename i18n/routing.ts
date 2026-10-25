import { defineRouting } from "next-intl/routing";

export const LOCALE_COOKIE = "NEXT_LOCALE";

// Supported languages. Every page lives under a locale prefix: /en, /km.
export const routing = defineRouting({
  locales: ["en", "km"],
  defaultLocale: "en",
  localePrefix: "always",
  // Remembers the visitor's choice for a year, so "/" opens their language.
  localeCookie: { name: LOCALE_COOKIE, maxAge: 60 * 60 * 24 * 365 },
});

export type Locale = (typeof routing.locales)[number];

/** How each language is labelled in the language switcher. */
export const localeLabels: Record<Locale, { name: string; short: string; flag: string }> = {
  en: { name: "English", short: "EN", flag: "🇬🇧" },
  km: { name: "ភាសាខ្មែរ", short: "ខ្មែរ", flag: "🇰🇭" },
};

/** Open Graph locale codes. */
export const ogLocales: Record<Locale, string> = { en: "en_US", km: "km_KH" };
