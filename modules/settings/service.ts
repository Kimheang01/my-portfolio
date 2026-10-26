// What the admin can do with links and SEO settings. Every function checks
// requireAdmin() itself, so a page or action can't forget to.
import "server-only";
import { requireAdmin } from "@/lib/authorization";
import * as repository from "./repository";
import type { SettingsData } from "./schema";

export type { AdminSettings } from "./repository";

export async function getSettings() {
  await requireAdmin();
  return repository.getSettings();
}

export async function saveSettings(data: SettingsData) {
  await requireAdmin();
  await repository.saveSettings(data);
}
