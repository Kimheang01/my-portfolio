// What the admin can do with experience entries. Every function checks
// requireAdmin() itself, so a page or action can't forget to.
import "server-only";
import { isUniqueViolation } from "@/db/errors";
import { requireAdmin } from "@/lib/authorization";
import type { FieldErrors } from "@/modules/admin/validation";
import * as repository from "./repository";
import type { ExperienceData } from "./schema";

export type { AdminExperience } from "./repository";

export type SaveResult =
  | { ok: true; id: number }
  | { ok: false; message: string; fieldErrors?: FieldErrors };

export async function getExperience() {
  await requireAdmin();
  return repository.listExperience();
}

export async function getExperienceEntry(id: number) {
  await requireAdmin();
  return repository.findExperience(id);
}

/** Creates the entry when id is null, otherwise updates it. */
export async function saveExperience(id: number | null, data: ExperienceData): Promise<SaveResult> {
  await requireAdmin();
  try {
    if (id === null) return { ok: true, id: await repository.insertExperience(data) };
    if (await repository.updateExperience(id, data)) return { ok: true, id };
    return { ok: false, message: "This entry no longer exists." };
  } catch (error) {
    if (isUniqueViolation(error, "experiences_slug_unique")) {
      return {
        ok: false,
        message: "Check the highlighted fields.",
        fieldErrors: { slug: "Another entry already uses this slug." },
      };
    }
    throw error;
  }
}

export async function moveExperience(id: number, direction: "up" | "down") {
  await requireAdmin();
  return repository.moveExperience(id, direction);
}
