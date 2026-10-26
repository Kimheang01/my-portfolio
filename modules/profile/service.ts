// What the admin can do with the profile. Every function checks
// requireAdmin() itself, so a page or action can't forget to.
import "server-only";
import { requireAdmin } from "@/lib/authorization";
import * as repository from "./repository";
import type { ProfileData } from "./schema";

export type { AdminProfile } from "./repository";

export async function getProfile() {
  await requireAdmin();
  return repository.getProfile();
}

export async function saveProfile(data: ProfileData) {
  await requireAdmin();
  await repository.saveProfile(data);
}
