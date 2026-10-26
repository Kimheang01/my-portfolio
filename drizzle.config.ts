import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Reads DATABASE_URL from the same .env files as Next.js. Production files
// (.env.production*) are only read with NODE_ENV=production, so a local
// migration never reaches the production database by accident.
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema/index.ts",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  strict: true,
});
