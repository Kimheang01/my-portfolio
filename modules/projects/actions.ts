"use server";

// Server actions for the project screens. Each one checks the admin, checks
// its input, saves, then refreshes the public site (updateTag) and the admin
// page the browser is on (refresh).
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/authorization";
import { PORTFOLIO_TAG } from "@/modules/portfolio/public";
import { invalid, type ActionState } from "@/modules/admin/validation";
import { projectInput, type ProjectStatus } from "./schema";
import * as service from "./service";

// Arguments come from the browser, so ids are checked too.
const projectId = z.number().int().positive();

const savedMessages: Record<ProjectStatus, string> = {
  draft: "Saved as a draft. It isn't on the site.",
  published: "Published. It's on the site now.",
  archived: "Archived. It isn't on the site.",
};

export async function saveProject(
  id: number | null,
  _previous: ActionState,
  input: unknown,
): Promise<ActionState> {
  await requireAdmin();
  const parsedId = id === null ? null : projectId.safeParse(id);
  if (parsedId && !parsedId.success) return { ok: false, message: "Unknown project." };
  const parsed = projectInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const result = await service.saveProject(parsedId?.data ?? null, parsed.data);
  if (!result.ok) return result;

  updateTag(PORTFOLIO_TAG);
  if (id === null) redirect(`/admin/projects/${result.id}/edit?created=1`);
  refresh();
  return { ok: true, message: savedMessages[parsed.data.status] };
}

export async function moveProject(id: number, direction: "up" | "down") {
  await requireAdmin();
  const parsedId = projectId.parse(id);
  const parsedDirection = z.enum(["up", "down"]).parse(direction);
  if (await service.moveProject(parsedId, parsedDirection)) {
    updateTag(PORTFOLIO_TAG);
    refresh();
  }
}
