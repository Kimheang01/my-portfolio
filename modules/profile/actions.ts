"use server";

// The profile form's server action: check the admin, check the input,
// save, then refresh the public site and the admin page.
import { refresh, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/authorization";
import { invalid, type ActionState } from "@/modules/admin/validation";
import { PORTFOLIO_TAG } from "@/modules/portfolio/public";
import { profileInput } from "./schema";
import * as service from "./service";

export async function saveProfile(_previous: ActionState, input: unknown): Promise<ActionState> {
  await requireAdmin();
  const parsed = profileInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const error = await service.saveProfile(parsed.data);
  if (error) return { ok: false, message: error };
  updateTag(PORTFOLIO_TAG);
  refresh();
  return { ok: true, message: "Saved. It's on the site now." };
}
