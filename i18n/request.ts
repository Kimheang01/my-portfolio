import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as localeParam } from "next/root-params";
import { routing } from "./routing";

// Loads the messages for the current request. The locale comes from the
// `[locale]` segment, so pages stay statically rendered.
export default getRequestConfig(async ({ locale }) => {
  // `locale` is only set when a function is called with an explicit locale,
  // e.g. getTranslations({ locale: "km" }).
  const requested = locale ?? (await localeParam());
  const resolved = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale: resolved,
    messages: (await import(`../messages/${resolved}.json`)).default,
    // Dates are shown in Cambodia time on both the server and the client.
    timeZone: "Asia/Phnom_Penh",
  };
});
