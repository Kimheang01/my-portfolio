// What the admin can do with the media library. Every function checks
// requireAdmin() itself, so a page or action can't forget to.
import "server-only";
import { requireAdmin } from "@/lib/authorization";
import * as repository from "./repository";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, UPLOAD_FOLDER, type MediaItem } from "./schema";
import { blobConfigured, deleteBlob, findBlob, isBlobUrl } from "./storage";

export type Result<T = undefined> = { ok: true; value: T } | { ok: false; message: string };

export async function getMediaLibrary() {
  await requireAdmin();
  return repository.listMedia();
}

/**
 * Adds a file the browser has just uploaded to Blob. The file is looked up
 * in this project's store, and its type and size checked there, so nothing
 * the browser claims about it is trusted.
 */
export async function registerUpload(input: {
  url: string;
  width: number | null;
  height: number | null;
}): Promise<Result<MediaItem>> {
  await requireAdmin();
  if (!blobConfigured()) return { ok: false, message: "Uploads aren't set up yet (BLOB_READ_WRITE_TOKEN is missing)." };
  if (!isBlobUrl(input.url)) return { ok: false, message: "That file isn't in this site's Blob store." };

  const blob = await findBlob(input.url);
  if (!blob || !blob.pathname.startsWith(UPLOAD_FOLDER)) {
    return { ok: false, message: "That file isn't in this site's Blob store." };
  }
  if (!(IMAGE_TYPES as readonly string[]).includes(blob.contentType)) {
    return { ok: false, message: "Only JPG, PNG and WebP images can be used." };
  }
  if (blob.size > MAX_IMAGE_BYTES) return { ok: false, message: "Images must be 5 MB or smaller." };

  const item = await repository.insertBlobMedia({
    storageKey: blob.pathname,
    url: blob.url,
    mimeType: blob.contentType,
    sizeBytes: blob.size,
    width: input.width,
    height: input.height,
  });
  return { ok: true, value: item };
}

/**
 * Deletes an image nothing uses: its file in Blob, then its row. An image
 * in /public (the site's original ones) only leaves the library.
 */
export async function deleteMedia(id: number): Promise<Result> {
  await requireAdmin();
  const item = await repository.findMedia(id);
  if (!item) return { ok: false, message: "This image no longer exists." };
  if (item.usedBy.length) {
    return { ok: false, message: `It's still used as: ${item.usedBy.join(", ")}. Choose another image there first.` };
  }
  if (item.provider === "vercel_blob") await deleteBlob(item.url);
  await repository.deleteMediaRow(id);
  return { ok: true, value: undefined };
}
