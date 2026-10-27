import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { experiences, projects, skills } from "@/db/schema";
import { requireAdmin } from "@/lib/authorization";

/** Totals for the overview page. Includes drafts, so admins only. */
export async function getContentCounts() {
  await requireAdmin();
  const [projectsTotal, projectsPublished, skillsTotal, experienceTotal] = await Promise.all([
    db.$count(projects),
    db.$count(projects, eq(projects.status, "published")),
    db.$count(skills),
    db.$count(experiences),
  ]);
  return { projectsTotal, projectsPublished, skillsTotal, experienceTotal };
}
