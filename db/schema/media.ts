import { integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { timestamps } from "./columns";

// Where a file is stored: "local" files are in /public (the ones the site
// started with), "vercel_blob" files were uploaded in the admin.
export const mediaProviderEnum = pgEnum("media_provider", ["local", "vercel_blob"]);

// Every image the site shows. Only the file's details are stored here,
// never the file itself.
export const media = pgTable("media", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  provider: mediaProviderEnum().notNull().default("local"),
  /** The file's path in /public, or its pathname in Vercel Blob */
  storageKey: text().notNull().unique(),
  url: text().notNull(),
  mimeType: text().notNull(),
  sizeBytes: integer(),
  width: integer(),
  height: integer(),
  altText: text(),
  ...timestamps,
});
