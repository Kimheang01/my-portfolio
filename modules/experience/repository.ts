// Database reads and writes for experience entries. No permission checks
// here: only service.ts calls these, after requireAdmin().
import "server-only";
import { asc, eq, max } from "drizzle-orm";
import { db } from "@/db";
import { moveRow } from "@/db/reorder";
import { experiences, experienceTranslations } from "@/db/schema";
import { routing, type Locale } from "@/i18n/routing";
import type { ContentStatus } from "@/modules/admin/validation";
import type { ExperienceData, ExperienceKind } from "./schema";

export type AdminExperience = {
  id: number;
  slug: string;
  kind: ExperienceKind;
  organization: string;
  start: string;
  end: string | null;
  tags: string[];
  status: ContentStatus;
  translations: Record<Locale, { title: string; highlights: string[]; description: string }>;
};

type Row = typeof experiences.$inferSelect & {
  translations: (typeof experienceTranslations.$inferSelect)[];
};

function toAdminExperience(row: Row): AdminExperience {
  const translations = Object.fromEntries(
    routing.locales.map((locale) => {
      const t = row.translations.find((text) => text.locale === locale);
      return [locale, { title: t?.title ?? "", highlights: t?.highlights ?? [], description: t?.description ?? "" }];
    }),
  ) as AdminExperience["translations"];
  return {
    id: row.id,
    slug: row.slug,
    kind: row.kind,
    organization: row.organization,
    start: row.startMonth,
    end: row.endMonth,
    tags: row.tags,
    status: row.status,
    translations,
  };
}

/** Every entry, drafts and archived ones too, in display order. */
export async function listExperience(): Promise<AdminExperience[]> {
  const rows = await db.query.experiences.findMany({
    orderBy: [asc(experiences.sortOrder), asc(experiences.id)],
    with: { translations: true },
  });
  return rows.map(toAdminExperience);
}

export async function findExperience(id: number): Promise<AdminExperience | null> {
  const row = await db.query.experiences.findFirst({ where: eq(experiences.id, id), with: { translations: true } });
  return row ? toAdminExperience(row) : null;
}

const columns = (data: ExperienceData) => ({
  slug: data.slug,
  kind: data.kind,
  organization: data.organization,
  startMonth: data.start,
  endMonth: data.end,
  tags: data.tags,
  status: data.status,
});

/** Adds an entry at the end of the list. Returns its id. */
export async function insertExperience(data: ExperienceData): Promise<number> {
  return db.transaction(async (tx) => {
    const [{ last }] = await tx.select({ last: max(experiences.sortOrder) }).from(experiences);
    const [row] = await tx
      .insert(experiences)
      .values({ ...columns(data), sortOrder: (last ?? -1) + 1 })
      .returning({ id: experiences.id });
    await tx
      .insert(experienceTranslations)
      .values(routing.locales.map((locale) => ({ experienceId: row.id, locale, ...data.translations[locale] })));
    return row.id;
  });
}

/** Saves an entry and its text in every language. False if it doesn't exist. */
export async function updateExperience(id: number, data: ExperienceData): Promise<boolean> {
  return db.transaction(async (tx) => {
    const updated = await tx
      .update(experiences)
      .set(columns(data))
      .where(eq(experiences.id, id))
      .returning({ id: experiences.id });
    if (!updated.length) return false;
    for (const locale of routing.locales) {
      const text = data.translations[locale];
      await tx
        .insert(experienceTranslations)
        .values({ experienceId: id, locale, ...text })
        .onConflictDoUpdate({
          target: [experienceTranslations.experienceId, experienceTranslations.locale],
          set: text,
        });
    }
    return true;
  });
}

/** Moves an entry one place up or down in the timeline. */
export const moveExperience = (id: number, direction: "up" | "down") => moveRow(experiences, id, direction);
