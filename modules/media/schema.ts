// Upload rules shared by the browser (checked before uploading, for quick
// feedback) and the server (which decides).
import { z } from "zod";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
/** Uploads go under this folder in the Blob store. */
export const UPLOAD_FOLDER = "portfolio/";

/** An image in the media library, and what uses it. */
export type MediaItem = {
  id: number;
  url: string;
  provider: "local" | "vercel_blob";
  mimeType: string;
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
  /** e.g. ["Profile photo", "BS One logo"]; empty when nothing uses it */
  usedBy: string[];
};

const dimension = z.number().int().min(1).max(20000).nullable();

/** What the browser sends after an upload finishes. */
export const registerInput = z.object({
  url: z.url(),
  width: dimension,
  height: dimension,
});

/** A chosen image, or none. */
export const mediaId = z.number().int().positive().nullable();

export const formatSize = (bytes: number | null) =>
  bytes === null ? "" : bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
