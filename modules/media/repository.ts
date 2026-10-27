// Database reads and writes for the media library. No permission checks
// here: only service.ts calls these, after requireAdmin().
import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import type { MediaItem } from "./schema";

/** What uses each image, by media id: the profile photo, project logos and screenshots. */
async function usage(): Promise<Map<number, string[]>> {
  const [profileRow, projectRows] = await Promise.all([
    db.query.profile.findFirst({ columns: { photoMediaId: true } }),
    db.query.projects.findMany({
      columns: { slug: true, logoMediaId: true, imageMediaId: true },
      with: { translations: { columns: { locale: true, title: true } } },
    }),
  ]);
  const used = new Map<number, string[]>();
  const add = (id: number | null | undefined, what: string) => {
    if (id) used.set(id, [...(used.get(id) ?? []), what]);
  };
  add(profileRow?.photoMediaId, "Profile photo");
  for (const project of projectRows) {
    const title = project.translations.find((t) => t.locale === "en")?.title || project.slug;
    add(project.logoMediaId, `${title} logo`);
    add(project.imageMediaId, `${title} screenshot`);
  }
  return used;
}

const toItem = (row: typeof media.$inferSelect, usedBy: string[]): MediaItem => ({
  id: row.id,
  url: row.url,
  provider: row.provider,
  mimeType: row.mimeType,
  sizeBytes: row.sizeBytes,
  width: row.width,
  height: row.height,
  usedBy,
});

/** Every image, newest first. */
export async function listMedia(): Promise<MediaItem[]> {
  const [rows, used] = await Promise.all([db.select().from(media).orderBy(desc(media.createdAt), desc(media.id)), usage()]);
  return rows.map((row) => toItem(row, used.get(row.id) ?? []));
}

export async function findMedia(id: number) {
  const [row] = await db.select().from(media).where(eq(media.id, id));
  if (!row) return null;
  return toItem(row, (await usage()).get(id) ?? []);
}

/** Adds an uploaded file; a file that's already in the library is returned as it is. */
export async function insertBlobMedia(values: {
  storageKey: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
}): Promise<MediaItem> {
  await db
    .insert(media)
    .values({ provider: "vercel_blob", ...values })
    .onConflictDoNothing({ target: media.storageKey });
  const [row] = await db.select().from(media).where(eq(media.storageKey, values.storageKey));
  return toItem(row, (await usage()).get(row.id) ?? []);
}

export async function deleteMediaRow(id: number) {
  await db.delete(media).where(eq(media.id, id));
}
