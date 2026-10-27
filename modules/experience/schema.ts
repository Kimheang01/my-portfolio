// What an experience form may contain (jobs and education), checked on the
// server. Publishing needs a title and some text (highlights or a
// description) in every language.
import { z } from "zod";
import { routing, type Locale } from "@/i18n/routing";
import {
  CONTENT_STATUSES,
  lines,
  perLocale,
  required,
  slug,
  tags,
  text,
} from "@/modules/admin/validation";

export const EXPERIENCE_KINDS = ["work", "education"] as const;
export type ExperienceKind = (typeof EXPERIENCE_KINDS)[number];

const month = z.string().regex(/^[0-9]{4}-(0[1-9]|1[0-2])$/, "Pick a month.");

export type ExperienceText = { title: string; highlights: string; description: string };

const experienceText = z.object({
  /** The job title, or the program for an education entry */
  title: text(80),
  /** One per line; jobs list highlights */
  highlights: lines(8, 300),
  /** Education entries usually have a description instead */
  description: text(600),
});

export const experienceInput = z
  .object({
    slug,
    kind: z.enum(EXPERIENCE_KINDS),
    organization: required(100),
    start: month,
    // Empty for the current role.
    end: z.union([z.literal(""), month]).transform((value) => value || null),
    tags,
    status: z.enum(CONTENT_STATUSES),
    translations: perLocale(experienceText),
  })
  .superRefine((entry, ctx) => {
    // "YYYY-MM" strings sort by date.
    if (entry.end && entry.end < entry.start) {
      ctx.addIssue({ code: "custom", path: ["end"], message: "The end can't be before the start." });
    }
    if (entry.status !== "published") return;
    for (const locale of routing.locales) {
      const t = entry.translations[locale];
      if (!t.title) {
        ctx.addIssue({ code: "custom", path: ["translations", locale, "title"], message: "Needed before publishing." });
      }
      if (!t.highlights.length && !t.description) {
        ctx.addIssue({
          code: "custom",
          path: ["translations", locale, "highlights"],
          message: "Add highlights or a description before publishing.",
        });
      }
    }
  });

export type ExperienceInput = z.input<typeof experienceInput>;
export type ExperienceData = z.output<typeof experienceInput>;

/** Languages that can't be published yet: no title, or no text at all. */
export function missingLocales(translations: Record<Locale, ExperienceText>): Locale[] {
  return routing.locales.filter((locale) => {
    const t = translations[locale];
    return !t.title.trim() || (!t.highlights.trim() && !t.description.trim());
  });
}
