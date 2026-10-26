// What a project form may contain, checked on the server before anything is
// saved. Drafts may be unfinished; publishing needs every text in every
// language, because the public site would otherwise show blanks.
import { z } from "zod";
import { routing, type Locale } from "@/i18n/routing";
import {
  CONTENT_STATUSES,
  httpsLink,
  perLocale,
  slug,
  tags,
  text,
  type ContentStatus,
} from "@/modules/admin/validation";

export type ProjectStatus = ContentStatus;

/** The text a project has in each language; all of it is needed to publish. */
export const TRANSLATED_FIELDS = ["title", "type", "context", "description"] as const;
export type TranslatedField = (typeof TRANSLATED_FIELDS)[number];
export type ProjectText = Record<TranslatedField, string>;

const projectText = z.object({
  title: text(80),
  type: text(40),
  context: text(60),
  description: text(400),
});

export const projectInput = z
  .object({
    slug,
    // The card adds alpha digits to this, so it must be exactly #rrggbb.
    color: z
      .string()
      .trim()
      .regex(/^#[0-9a-fA-F]{6}$/, "Use a color like #2563eb.")
      .transform((value) => value.toLowerCase()),
    monogram: text(3).transform((value) => value || null),
    href: httpsLink,
    repo: httpsLink,
    tags,
    status: z.enum(CONTENT_STATUSES),
    translations: perLocale(projectText),
  })
  .superRefine((project, ctx) => {
    if (project.status !== "published") return;
    for (const locale of routing.locales) {
      for (const field of TRANSLATED_FIELDS) {
        if (!project.translations[locale][field]) {
          ctx.addIssue({
            code: "custom",
            path: ["translations", locale, field],
            message: "Needed before publishing.",
          });
        }
      }
    }
  });

/** What the editor sends. */
export type ProjectInput = z.input<typeof projectInput>;
/** What's saved, after trimming and checking. */
export type ProjectData = z.output<typeof projectInput>;

/** Languages with some text still empty, which can't be published yet. */
export function missingLocales(translations: Partial<Record<Locale, Partial<ProjectText>>>): Locale[] {
  return routing.locales.filter((locale) =>
    TRANSLATED_FIELDS.some((field) => !translations[locale]?.[field]?.trim()),
  );
}
