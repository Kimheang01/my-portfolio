// What the Links & SEO form may contain: the social links (one per
// platform, in display order) and the page title and description.
import { z } from "zod";
import { routing, type Locale } from "@/i18n/routing";
import { httpsLink, perLocale, required, text } from "@/modules/admin/validation";

/** The platforms components/SocialIcon.tsx has an icon for. */
export const SOCIAL_PLATFORMS = ["LinkedIn", "Instagram", "Telegram", "GitHub"] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

const social = z.object({
  platform: z.enum(SOCIAL_PLATFORMS),
  /** Empty removes the link from the site */
  href: httpsLink,
  handle: text(60).transform((value) => value || null),
  visible: z.boolean(),
});

export const settingsInput = z.object({
  socials: z
    .array(social)
    .refine((list) => SOCIAL_PLATFORMS.every((p) => list.filter((s) => s.platform === p).length === 1), {
      message: "Each platform must appear once.",
    }),
  seo: perLocale(
    z.object({
      /** The browser tab and search result title */
      title: required(70),
      description: required(200),
    }),
  ),
});

export type SettingsInput = z.input<typeof settingsInput>;
export type SettingsData = z.output<typeof settingsInput>;

export function missingLocales(seo: Record<Locale, { title: string; description: string }>): Locale[] {
  return routing.locales.filter((locale) => !seo[locale].title.trim() || !seo[locale].description.trim());
}
