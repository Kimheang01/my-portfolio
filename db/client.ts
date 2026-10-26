import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Opens a connection pool. The app uses the shared one in db/index.ts;
// scripts such as the seed create their own and close it when done.
export function createDb(url: string, options: { max?: number } = {}) {
  // Connection poolers in transaction mode (e.g. Supabase's pooler) don't
  // support prepared statements.
  const client = postgres(url, { prepare: false, ...options });
  const db = drizzle(client, { schema, casing: "snake_case" });
  return { db, client };
}

export type Database = ReturnType<typeof createDb>["db"];

export function databaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
  }
  return url;
}
