// Uploads an image from the browser straight to Vercel Blob, then records
// it in the media library. The server checks the file again (type, size,
// that it's in this site's store), so these checks are only for quick feedback.
import { upload } from "@vercel/blob/client";
import { registerMedia } from "@/modules/media/actions";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, UPLOAD_FOLDER, type MediaItem } from "@/modules/media/schema";

const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

async function dimensions(file: File) {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return { width: null, height: null };
  }
}

export async function uploadImage(file: File): Promise<MediaItem> {
  if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) throw new Error("Choose a JPG, PNG or WebP image.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Images must be 5 MB or smaller.");

  // "My Logo.PNG" → "portfolio/my-logo.png"; Blob adds a random suffix.
  const base = file.name.replace(/\.[^.]*$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "image";
  const pathname = `${UPLOAD_FOLDER}${base.slice(0, 50)}.${extensions[file.type]}`;

  const [{ width, height }, blob] = await Promise.all([
    dimensions(file),
    upload(pathname, file, { access: "public", handleUploadUrl: "/api/admin/uploads", contentType: file.type }),
  ]);
  const result = await registerMedia({ url: blob.url, width, height });
  if (!result.ok) throw new Error(result.message);
  return result.item;
}
