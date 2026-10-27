"use server";

// Server actions for the experience screens: check the admin, check the
// input, save, then refresh the public site and the admin page.
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { logAdminChange } from "@/lib/audit";
import { requireAdmin } from "@/lib/authorization";
import { invalid, type ActionState, type ContentStatus } from "@/modules/admin/validation";
import { PORTFOLIO_TAG } from "@/modules/portfolio/public";
import { experienceInput } from "./schema";
import * as service from "./service";

// Arguments come from the browser, so ids are checked too.
const entryId = z.number().int().positive();

const savedMessages: Record<ContentStatus, string> = {
  draft: "Saved as a draft. It isn't on the site.",
  published: "Published. It's on the site now.",
  archived: "Archived. It isn't on the site.",
};

export async function saveExperience(
  id: number | null,
  _previous: ActionState,
  input: unknown,
): Promise<ActionState> {
  await requireAdmin();
  const parsedId = id === null ? null : entryId.safeParse(id);
  if (parsedId && !parsedId.success) return { ok: false, message: "Unknown entry." };
  const parsed = experienceInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const result = await service.saveExperience(parsedId?.data ?? null, parsed.data);
  if (!result.ok) return result;
  logAdminChange("experience.save", { id: result.id, status: parsed.data.status });

  updateTag(PORTFOLIO_TAG);
  if (id === null) redirect(`/admin/experience/${result.id}/edit?created=1`);
  refresh();
  return { ok: true, message: savedMessages[parsed.data.status] };
}

export async function moveExperience(id: number, direction: "up" | "down") {
  await requireAdmin();
  const parsedId = entryId.parse(id);
  const parsedDirection = z.enum(["up", "down"]).parse(direction);
  if (await service.moveExperience(parsedId, parsedDirection)) {
    logAdminChange("experience.move", { id: parsedId, direction: parsedDirection });
    updateTag(PORTFOLIO_TAG);
    refresh();
  }
}
