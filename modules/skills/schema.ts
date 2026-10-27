// What a skill group form may contain. Skills have no draft state: a group
// is on the site as soon as it's saved. Technology names usually read the
// same in every language, so only the English name is required; an empty
// translation uses it.
import { z } from "zod";
import { routing, type Locale } from "@/i18n/routing";
import { perLocale, text } from "@/modules/admin/validation";

/** The icons components/SkillIcon.tsx draws. */
export const SKILL_ICONS = ["frontend", "backend", "mobile", "databases", "tools"] as const;
export type SkillIconId = (typeof SKILL_ICONS)[number];

const name = perLocale(text(40))
  .refine((names) => names[routing.defaultLocale] !== "", {
    path: [routing.defaultLocale],
    message: "Required.",
  })
  .transform(
    (names) =>
      Object.fromEntries(
        routing.locales.map((locale) => [locale, names[locale] || names[routing.defaultLocale]]),
      ) as Record<Locale, string>,
  );

export const skillGroupInput = z.object({
  icon: z.enum(SKILL_ICONS),
  names: name,
  skills: z.array(z.object({ names: name })).max(30, "Use at most 30 skills."),
});

export type SkillGroupInput = z.input<typeof skillGroupInput>;
export type SkillGroupData = z.output<typeof skillGroupInput>;
