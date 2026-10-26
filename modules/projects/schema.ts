// What a project form may contain, checked on the server before anything is
// saved. Drafts may be unfinished; publishing needs every text in every
// language, because the public site would otherwise show blanks.
import { z } from "zod";
import { routing, type Locale } from "@/i18n/routing";

export const PROJECT_STATUSES = ["draft", "published", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

/** The text a project has in each language; all of it is needed to publish. */
export const TRANSLATED_FIELDS = ["title", "type", "context", "description"] as const;
export type TranslatedField = (typeof TRANSLATED_FIELDS)[number];
export type ProjectText = Record<TranslatedField, string>;

const text = (max: number) => z.string().trim().max(max, `Keep it under ${max} characters.`);

const projectText = z.object({
  title: text(80),
  type: text(40),
  context: text(60),
  description: text(400),
});

// Empty means "no link". Links must be https so the site never points
// visitors at an insecure (or javascript:) address.
const link = text(500)
  .refine((value) => value === "" || (/^https:\/\/\S+$/.test(value) && URL.canParse(value)), {
    message: "Use a full link starting with https://",
  })
  .transform((value) => value || null);

export const projectInput = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1, "Give the project a slug.")
      .max(60, "Keep it under 60 characters.")
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lowercase letters and numbers, joined by single hyphens, e.g. bs-one."),
    // The card adds alpha digits to this, so it must be exactly #rrggbb.
    color: z
      .string()
      .trim()
      .regex(/^#[0-9a-fA-F]{6}$/, "Use a color like #2563eb.")
      .transform((value) => value.toLowerCase()),
    monogram: text(3).transform((value) => value || null),
    href: link,
    repo: link,
    // Typed as one comma-separated line, e.g. "React Native, Expo".
    tags: z
      .string()
      .max(500)
      .transform((value) => [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))])
      .pipe(z.array(z.string().max(30, "Keep each tag under 30 characters.")).max(12, "Use at most 12 tags.")),
    status: z.enum(PROJECT_STATUSES),
    translations: z.object(
      Object.fromEntries(routing.locales.map((locale) => [locale, projectText])) as Record<
        Locale,
        typeof projectText
      >,
    ),
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

/** Field errors keyed by path, e.g. "slug" or "translations.km.title". */
export type FieldErrors = Record<string, string>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) errors[issue.path.join(".")] ??= issue.message;
  return errors;
}

/** Languages with some text still empty, which can't be published yet. */
export function missingLocales(translations: Partial<Record<Locale, Partial<ProjectText>>>): Locale[] {
  return routing.locales.filter((locale) =>
    TRANSLATED_FIELDS.some((field) => !translations[locale]?.[field]?.trim()),
  );
}
