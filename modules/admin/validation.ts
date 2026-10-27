// Building blocks for the admin's form schemas (modules/*/schema.ts), and the
// result every admin server action returns. Safe to import in the browser:
// the editors use the types and the field rules.
import { z } from "zod";
import { routing, type Locale } from "@/i18n/routing";

export const CONTENT_STATUSES = ["draft", "published", "archived"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

/** Field errors keyed by path, e.g. "slug" or "translations.km.title". */
export type FieldErrors = Record<string, string>;

/** What an admin server action reports back to its form. */
export type ActionState =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: FieldErrors }
  | null;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) errors[issue.path.join(".")] ??= issue.message;
  return errors;
}

export const invalid = (error: z.ZodError): ActionState => ({
  ok: false,
  message: "Check the highlighted fields.",
  fieldErrors: fieldErrors(error),
});

export const text = (max: number) => z.string().trim().max(max, `Keep it under ${max} characters.`);
export const required = (max: number) => text(max).min(1, "Required.");

/** Lowercase words joined by hyphens, e.g. "bs-one"; used in links and as ids. */
export const slug = z
  .string()
  .trim()
  .min(1, "Give it a slug.")
  .max(60, "Keep it under 60 characters.")
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lowercase letters and numbers, joined by single hyphens, e.g. bs-one.");

// Empty means "no link". Links must be https so the site never points
// visitors at an insecure (or javascript:) address.
export const httpsLink = text(500)
  .refine((value) => value === "" || (/^https:\/\/\S+$/.test(value) && URL.canParse(value)), {
    message: "Use a full link starting with https://",
  })
  .transform((value) => value || null);

/** Typed as one comma-separated line, e.g. "React Native, Expo". */
export const tags = z
  .string()
  .max(500)
  .transform((value) => [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))])
  .pipe(z.array(z.string().max(30, "Keep each tag under 30 characters.")).max(12, "Use at most 12 tags."));

/** Typed one item per line (blank lines are ignored). */
export const lines = (maxItems: number, maxLength: number) =>
  z
    .string()
    .transform((value) => value.split("\n").map((line) => line.trim()).filter(Boolean))
    .pipe(
      z
        .array(z.string().max(maxLength, `Keep each line under ${maxLength} characters.`))
        .max(maxItems, `Use at most ${maxItems} lines.`),
    );

/** One copy of a schema per language: { en: …, km: … }. */
export function perLocale<T extends z.ZodType>(schema: T) {
  return z.object(Object.fromEntries(routing.locales.map((locale) => [locale, schema])) as Record<Locale, T>);
}
