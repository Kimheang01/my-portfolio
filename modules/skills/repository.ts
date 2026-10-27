// Database reads and writes for skill groups and their skills. No
// permission checks here: only service.ts calls these, after requireAdmin().
import "server-only";
import { asc, eq, like, max } from "drizzle-orm";
import { db } from "@/db";
import { moveRow } from "@/db/reorder";
import { skillCategories, skillCategoryTranslations, skills, skillTranslations } from "@/db/schema";
import { routing, type Locale } from "@/i18n/routing";
import { toSlug } from "@/lib/slug";
import type { SkillGroupData, SkillIconId } from "./schema";

type Names = Record<Locale, string>;

export type AdminSkillGroup = {
  id: number;
  icon: SkillIconId;
  names: Names;
  skills: { names: Names }[];
};

const namesOf = (translations: { locale: Locale; name: string }[]) =>
  Object.fromEntries(
    routing.locales.map((locale) => [locale, translations.find((t) => t.locale === locale)?.name ?? ""]),
  ) as Names;

const withSkills = {
  translations: true as const,
  skills: {
    orderBy: [asc(skills.sortOrder), asc(skills.id)],
    with: { translations: true as const },
  },
};

type Row = NonNullable<Awaited<ReturnType<typeof findRow>>>;
const findRow = (id: number) => db.query.skillCategories.findFirst({ where: eq(skillCategories.id, id), with: withSkills });

const toAdminGroup = (row: Row): AdminSkillGroup => ({
  id: row.id,
  icon: row.icon,
  names: namesOf(row.translations),
  skills: row.skills.map((skill) => ({ names: namesOf(skill.translations) })),
});

/** Every group with its skills, in display order. */
export async function listGroups(): Promise<AdminSkillGroup[]> {
  const rows = await db.query.skillCategories.findMany({
    orderBy: [asc(skillCategories.sortOrder), asc(skillCategories.id)],
    with: withSkills,
  });
  return rows.map(toAdminGroup);
}

export async function findGroup(id: number): Promise<AdminSkillGroup | null> {
  const row = await findRow(id);
  return row ? toAdminGroup(row) : null;
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function writeSkills(tx: Tx, categoryId: number, data: SkillGroupData) {
  await tx.delete(skills).where(eq(skills.categoryId, categoryId));
  for (const [sortOrder, skill] of data.skills.entries()) {
    const [row] = await tx.insert(skills).values({ categoryId, sortOrder }).returning({ id: skills.id });
    await tx
      .insert(skillTranslations)
      .values(routing.locales.map((locale) => ({ skillId: row.id, locale, name: skill.names[locale] })));
  }
}

/** Adds a group at the end. Returns its id. */
export async function insertGroup(data: SkillGroupData): Promise<number> {
  return db.transaction(async (tx) => {
    // The key is an internal id, made from the English name: "Front-end" → "front-end".
    const base = toSlug(data.names[routing.defaultLocale]) || "group";
    const taken = new Set(
      (await tx.select({ key: skillCategories.key }).from(skillCategories).where(like(skillCategories.key, `${base}%`))).map(
        (row) => row.key,
      ),
    );
    let key = base;
    for (let n = 2; taken.has(key); n++) key = `${base}-${n}`;

    const [{ last }] = await tx.select({ last: max(skillCategories.sortOrder) }).from(skillCategories);
    const [row] = await tx
      .insert(skillCategories)
      .values({ key, icon: data.icon, sortOrder: (last ?? -1) + 1 })
      .returning({ id: skillCategories.id });
    await tx
      .insert(skillCategoryTranslations)
      .values(routing.locales.map((locale) => ({ categoryId: row.id, locale, name: data.names[locale] })));
    await writeSkills(tx, row.id, data);
    return row.id;
  });
}

/** Saves a group: its icon, names, and its skills (replaced as a list). */
export async function updateGroup(id: number, data: SkillGroupData): Promise<boolean> {
  return db.transaction(async (tx) => {
    const updated = await tx
      .update(skillCategories)
      .set({ icon: data.icon })
      .where(eq(skillCategories.id, id))
      .returning({ id: skillCategories.id });
    if (!updated.length) return false;
    for (const locale of routing.locales) {
      await tx
        .insert(skillCategoryTranslations)
        .values({ categoryId: id, locale, name: data.names[locale] })
        .onConflictDoUpdate({
          target: [skillCategoryTranslations.categoryId, skillCategoryTranslations.locale],
          set: { name: data.names[locale] },
        });
    }
    await writeSkills(tx, id, data);
    return true;
  });
}

/** Deletes a group and its skills (they're removed with it). */
export async function deleteGroup(id: number): Promise<boolean> {
  const deleted = await db.delete(skillCategories).where(eq(skillCategories.id, id)).returning({ id: skillCategories.id });
  return deleted.length > 0;
}

export const moveGroup = (id: number, direction: "up" | "down") => moveRow(skillCategories, id, direction);
