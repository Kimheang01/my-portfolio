"use server";

// Server actions for the media library. Uploading itself goes straight from
// the browser to Blob (see app/api/admin/uploads); these record and remove
// the files.
import { refresh } from "next/cache";
import { logAdminChange } from "@/lib/audit";
import { requireAdmin } from "@/lib/authorization";
import { mediaId, registerInput, type MediaItem } from "./schema";
import * as service from "./service";

export type RegisterResult = { ok: true; item: MediaItem } | { ok: false; message: string };

export async function registerMedia(input: unknown): Promise<RegisterResult> {
  await requireAdmin();
  const parsed = registerInput.safeParse(input);
  if (!parsed.success) return { ok: false, message: "The upload didn't finish properly. Please try again." };
  const result = await service.registerUpload(parsed.data);
  if (!result.ok) return result;
  logAdminChange("media.upload", { id: result.value.id });
  return { ok: true, item: result.value };
}

export async function deleteMedia(id: number): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const parsed = mediaId.unwrap().safeParse(id);
  if (!parsed.success) return { ok: false, message: "Unknown image." };
  const result = await service.deleteMedia(parsed.data);
  if (!result.ok) return result;
  logAdminChange("media.delete", { id: parsed.data });
  // Nothing on the site used it, so only the admin page needs refreshing.
  refresh();
  return { ok: true, message: "Deleted." };
}
