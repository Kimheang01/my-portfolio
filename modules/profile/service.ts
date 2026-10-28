// What the admin can do with the profile. Every function checks
// requireAdmin() itself, so a page or action can't forget to.
import "server-only";
import { isMissingReference } from "@/db/errors";
import { requireAdmin } from "@/lib/authorization";
import * as repository from "./repository";
import type { ProfileData } from "./schema";


export async function getProfile() {
  await requireAdmin();
  return repository.getProfile();
}

/** Saves the profile. Returns an error message, or null when it's saved. */
export async function saveProfile(data: ProfileData): Promise<string | null> {
  await requireAdmin();
  try {
    await repository.saveProfile(data);
    return null;
  } catch (error) {
    // The chosen photo was deleted from the media library meanwhile.
    if (isMissingReference(error)) return "The chosen photo no longer exists. Choose it again.";
    throw error;
  }
}
