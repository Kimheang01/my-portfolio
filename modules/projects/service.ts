// What the admin can do with projects. Every function checks requireAdmin()
// itself, so a page or action can't forget to.
import "server-only";
import { requireAdmin } from "@/lib/authorization";
import * as repository from "./repository";
import type { FieldErrors, ProjectData } from "./schema";

export type { AdminProject } from "./repository";

export type SaveResult =
  | { ok: true; id: number }
  | { ok: false; message: string; fieldErrors?: FieldErrors };

export async function getProjects() {
  await requireAdmin();
  return repository.listProjects();
}

export async function getProject(id: number) {
  await requireAdmin();
  return repository.findProject(id);
}

/** Creates the project when id is null, otherwise updates it. */
export async function saveProject(id: number | null, data: ProjectData): Promise<SaveResult> {
  await requireAdmin();
  try {
    if (id === null) return { ok: true, id: await repository.insertProject(data) };
    if (await repository.updateProject(id, data)) return { ok: true, id };
    return { ok: false, message: "This project no longer exists." };
  } catch (error) {
    if (isUniqueViolation(error, "projects_slug_unique")) {
      return {
        ok: false,
        message: "Check the highlighted fields.",
        fieldErrors: { slug: "Another project already uses this slug." },
      };
    }
    throw error;
  }
}

export async function moveProject(id: number, direction: "up" | "down") {
  await requireAdmin();
  return repository.moveProject(id, direction);
}

// Postgres reports a duplicate value as error 23505; Drizzle wraps it.
function isUniqueViolation(error: unknown, constraint: string) {
  const cause = (error as { cause?: { code?: string; constraint_name?: string } })?.cause;
  return cause?.code === "23505" && cause.constraint_name === constraint;
}
