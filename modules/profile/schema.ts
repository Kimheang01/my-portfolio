// What the profile form may contain. The profile is always on the site, so
// every text is required in every language.
import { z } from "zod";
import { routing, type Locale } from "@/i18n/routing";
import { lines, perLocale, required } from "@/modules/admin/validation";

const atLeastOne = <T,>(list: T[]) => list.length > 0;

const heroRole = z.object({ first: required(30), second: required(30) });

const profileText = z.object({
  role: required(60),
  location: required(80),
  /** The rotating headline; the first one is also the page's <h1> */
  heroRoles: z.array(heroRole).refine(atLeastOne, "Add at least one.").pipe(z.array(heroRole).max(6, "Use at most 6.")),
  heroIntroHeading: required(120),
  heroIntroText: required(400),
  heroStatement: required(400),
  /** Typed with a blank line between paragraphs */
  aboutParagraphs: z
    .string()
    .transform((value) => value.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean))
    .pipe(
      z
        .array(z.string().max(1000, "Keep each paragraph under 1000 characters."))
        .refine(atLeastOne, "Add at least one paragraph.")
        .pipe(z.array(z.string()).max(6, "Use at most 6 paragraphs.")),
    ),
  spokenLanguages: lines(6, 60).refine(atLeastOne, "Add at least one."),
});

export const profileInput = z.object({
  name: required(80),
  email: z.string().trim().pipe(z.email("Use a valid email address.").max(120)),
  translations: perLocale(profileText),
});

export type ProfileInput = z.input<typeof profileInput>;
export type ProfileData = z.output<typeof profileInput>;
export type ProfileText = ProfileInput["translations"][Locale];

/** Languages with a required text still empty. */
export function missingLocales(translations: Record<Locale, ProfileText>): Locale[] {
  return routing.locales.filter((locale) => {
    const t = translations[locale];
    const texts = [t.role, t.location, t.heroIntroHeading, t.heroIntroText, t.heroStatement, t.aboutParagraphs, t.spokenLanguages];
    return (
      texts.some((value) => !value.trim()) ||
      !t.heroRoles.length ||
      t.heroRoles.some((r) => !r.first.trim() || !r.second.trim())
    );
  });
}
