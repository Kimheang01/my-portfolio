import type { Locale } from "@/i18n/routing";
import type messages from "./messages/en.json";

// Types next-intl's APIs: translation keys are checked against the English
// messages, and locales against the supported list.
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}
