// What the admin can do with skills. Every function checks requireAdmin()
// itself, so a page or action can't forget to.
import "server-only";
import { requireAdmin } from "@/lib/authorization";
import * as repository from "./repository";
import type { SkillGroupData } from "./schema";


export async function getSkillGroups() {
  await requireAdmin();
  return repository.listGroups();
}

export async function getSkillGroup(id: number) {
  await requireAdmin();
  return repository.findGroup(id);
}

/** Creates the group when id is null, otherwise updates it. Returns its id, or null if it's gone. */
export async function saveSkillGroup(id: number | null, data: SkillGroupData): Promise<number | null> {
  await requireAdmin();
  if (id === null) return repository.insertGroup(data);
  return (await repository.updateGroup(id, data)) ? id : null;
}

export async function deleteSkillGroup(id: number) {
  await requireAdmin();
  return repository.deleteGroup(id);
}

export async function moveSkillGroup(id: number, direction: "up" | "down") {
  await requireAdmin();
  return repository.moveGroup(id, direction);
}
