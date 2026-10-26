"use server";

// The Links & SEO form's server action: check the admin, check the input,
// save, then refresh the public site and the admin page.
import { refresh, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/authorization";
import { invalid, type ActionState } from "@/modules/admin/validation";
import { PORTFOLIO_TAG } from "@/modules/portfolio/public";
import { settingsInput } from "./schema";
import * as service from "./service";

export async function saveSettings(_previous: ActionState, input: unknown): Promise<ActionState> {
  await requireAdmin();
  const parsed = settingsInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  await service.saveSettings(parsed.data);
  updateTag(PORTFOLIO_TAG);
  refresh();
  return { ok: true, message: "Saved. It's on the site now." };
}
