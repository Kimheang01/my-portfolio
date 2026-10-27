// Talks to Vercel Blob. The read-write token (BLOB_READ_WRITE_TOKEN) is
// added by Vercel when a Blob store is connected to the project.
import "server-only";
import { BlobAccessError, BlobNotFoundError, del, head } from "@vercel/blob";

export const blobConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/** Public Blob URLs look like https://<store>.public.blob.vercel-storage.com/… */
export function isBlobUrl(url: string) {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/**
 * The file's details from this project's Blob store, or null if it isn't
 * there. A file from any other store comes back null too, so only uploads
 * made through the admin can be added to the media library.
 */
export async function findBlob(url: string) {
  try {
    return await head(url);
  } catch (error) {
    if (error instanceof BlobNotFoundError || error instanceof BlobAccessError) return null;
    throw error;
  }
}

export const deleteBlob = (url: string) => del(url);
