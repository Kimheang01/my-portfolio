// Admin login: Better Auth with GitHub as the only way to sign in, and only
// for one GitHub account. There is no sign-up form and no password login.
import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as authSchema from "@/db/schema/auth";

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not set. See .env.example.`);
  return value;
}

/**
 * The numeric id of the one GitHub account allowed into /admin. The id is
 * used rather than the username, which its owner can change (and someone
 * else could then take).
 */
export const adminGithubId = () => requiredEnv("ADMIN_GITHUB_ID");

function createAuth() {
  return betterAuth({
    baseURL: requiredEnv("BETTER_AUTH_URL"),
    secret: requiredEnv("BETTER_AUTH_SECRET"),
    database: drizzleAdapter(db, { provider: "pg", schema: authSchema, transaction: true }),
    socialProviders: {
      github: {
        clientId: requiredEnv("GITHUB_CLIENT_ID"),
        clientSecret: requiredEnv("GITHUB_CLIENT_SECRET"),
      },
    },
    // The site never uses the GitHub tokens Better Auth keeps, but if the
    // database leaked they'd still be encrypted.
    account: { encryptOAuthTokens: true },
    user: {
      // Runs on every GitHub sign-in, before a user, account or session is
      // saved. Any other account is turned away here, so it's never stored.
      validateUserInfo: ({ source }) => {
        const github = source.oauth?.providerId === "github" ? source.oauth.profile : undefined;
        if (String(github?.id) !== adminGithubId()) {
          return { error: "not_allowed", errorDescription: "This GitHub account can't sign in here." };
        }
      },
    },
    // Lets server actions (sign in, sign out) set the session cookie.
    plugins: [nextCookies()],
  });
}

let instance: ReturnType<typeof createAuth> | undefined;

/**
 * Better Auth, created on first use rather than on import. A missing admin
 * setting then only breaks /admin, never the build or the public site.
 */
export function getAuth() {
  instance ??= createAuth();
  return instance;
}
