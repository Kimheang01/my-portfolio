"use server";

// Server actions for the skills screens: check the admin, check the input,
// save, then refresh the public site and the admin page.
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { logAdminChange } from "@/lib/audit";
import { requireAdmin } from "@/lib/authorization";
import { invalid, type ActionState } from "@/modules/admin/validation";
import { PORTFOLIO_TAG } from "@/modules/portfolio/public";
import { skillGroupInput } from "./schema";
import * as service from "./service";

// Arguments come from the browser, so ids are checked too.
const groupId = z.number().int().positive();

export async function saveSkillGroup(
  id: number | null,
  _previous: ActionState,
  input: unknown,
): Promise<ActionState> {
  await requireAdmin();
  const parsedId = id === null ? null : groupId.safeParse(id);
  if (parsedId && !parsedId.success) return { ok: false, message: "Unknown group." };
  const parsed = skillGroupInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const savedId = await service.saveSkillGroup(parsedId?.data ?? null, parsed.data);
  if (savedId === null) return { ok: false, message: "This group no longer exists." };
  logAdminChange("skills.save", { id: savedId });

  updateTag(PORTFOLIO_TAG);
  if (id === null) redirect(`/admin/skills/${savedId}/edit?created=1`);
  refresh();
  return { ok: true, message: "Saved. It's on the site now." };
}

export async function deleteSkillGroup(id: number) {
  await requireAdmin();
  const parsedId = groupId.parse(id);
  if (await service.deleteSkillGroup(parsedId)) {
    logAdminChange("skills.delete", { id: parsedId });
    updateTag(PORTFOLIO_TAG);
  }
  redirect("/admin/skills");
}

export async function moveSkillGroup(id: number, direction: "up" | "down") {
  await requireAdmin();
  const parsedId = groupId.parse(id);
  const parsedDirection = z.enum(["up", "down"]).parse(direction);
  if (await service.moveSkillGroup(parsedId, parsedDirection)) {
    logAdminChange("skills.move", { id: parsedId, direction: parsedDirection });
    updateTag(PORTFOLIO_TAG);
    refresh();
  }
}
