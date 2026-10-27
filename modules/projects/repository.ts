// Database reads and writes for projects. No permission checks here: only
// service.ts calls these, after requireAdmin().
import "server-only";
import { asc, eq, max } from "drizzle-orm";
import { db } from "@/db";
import { moveRow } from "@/db/reorder";
import { projects, projectTranslations } from "@/db/schema";
import { routing, type Locale } from "@/i18n/routing";
import type { ProjectData, ProjectStatus, ProjectText } from "./schema";

export type AdminProject = {
  id: number;
  slug: string;
  status: ProjectStatus;
  color: string;
  monogram: string | null;
  href: string | null;
  repo: string | null;
  tags: string[];
  logoMediaId: number | null;
  imageMediaId: number | null;
  updatedAt: Date;
  translations: Record<Locale, ProjectText>;
};

const emptyText: ProjectText = { title: "", type: "", context: "", description: "" };

const withRelations = { translations: true } as const;

type Row = NonNullable<Awaited<ReturnType<typeof findRow>>>;

const findRow = (id: number) => db.query.projects.findFirst({ where: eq(projects.id, id), with: withRelations });

function toAdminProject(row: Row): AdminProject {
  const translations = Object.fromEntries(
    routing.locales.map((locale) => {
      const text = row.translations.find((t) => t.locale === locale);
      return [
        locale,
        text
          ? { title: text.title, type: text.type, context: text.context, description: text.description }
          : emptyText,
      ];
    }),
  ) as Record<Locale, ProjectText>;

  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    color: row.color,
    monogram: row.monogram,
    href: row.href,
    repo: row.repo,
    tags: row.tags,
    logoMediaId: row.logoMediaId,
    imageMediaId: row.imageMediaId,
    updatedAt: row.updatedAt,
    translations,
  };
}

/** Every project, drafts and archived ones too, in display order. */
export async function listProjects(): Promise<AdminProject[]> {
  const rows = await db.query.projects.findMany({
    orderBy: [asc(projects.sortOrder), asc(projects.id)],
    with: withRelations,
  });
  return rows.map(toAdminProject);
}

export async function findProject(id: number): Promise<AdminProject | null> {
  const row = await findRow(id);
  return row ? toAdminProject(row) : null;
}

const projectColumns = (data: ProjectData) => ({
  slug: data.slug,
  status: data.status,
  color: data.color,
  monogram: data.monogram,
  href: data.href,
  repo: data.repo,
  tags: data.tags,
  logoMediaId: data.logoMediaId,
  imageMediaId: data.imageMediaId,
});

/** Adds a project at the end of the list. Returns its id. */
export async function insertProject(data: ProjectData): Promise<number> {
  return db.transaction(async (tx) => {
    const [{ last }] = await tx.select({ last: max(projects.sortOrder) }).from(projects);
    const [row] = await tx
      .insert(projects)
      .values({ ...projectColumns(data), sortOrder: (last ?? -1) + 1 })
      .returning({ id: projects.id });
    await tx
      .insert(projectTranslations)
      .values(routing.locales.map((locale) => ({ projectId: row.id, locale, ...data.translations[locale] })));
    return row.id;
  });
}

/** Saves a project and its text in every language. False if it doesn't exist. */
export async function updateProject(id: number, data: ProjectData): Promise<boolean> {
  return db.transaction(async (tx) => {
    const updated = await tx
      .update(projects)
      .set(projectColumns(data))
      .where(eq(projects.id, id))
      .returning({ id: projects.id });
    if (!updated.length) return false;
    for (const locale of routing.locales) {
      const text = data.translations[locale];
      await tx
        .insert(projectTranslations)
        .values({ projectId: id, locale, ...text })
        .onConflictDoUpdate({
          target: [projectTranslations.projectId, projectTranslations.locale],
          set: text,
        });
    }
    return true;
  });
}

/** Moves a project one place up or down in the list. */
export const moveProject = (id: number, direction: "up" | "down") => moveRow(projects, id, direction);
