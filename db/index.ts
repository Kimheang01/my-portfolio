import "server-only";
import { createDb, databaseUrl, type Database } from "./client";

// The app's database connection. In development, hot reloads re-run this
// file, so the connection is kept on globalThis instead of opening a new
// pool on every edit.
const globalForDb = globalThis as unknown as { db?: Database };

export const db = globalForDb.db ?? createDb(databaseUrl()).db;

if (process.env.NODE_ENV !== "production") globalForDb.db = db;
