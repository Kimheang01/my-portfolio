import "server-only";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { account } from "@/db/schema/auth";
import { adminGithubId, getAuth } from "./auth";

export type Admin = { name: string; email: string };

type Check = { admin: Admin } | { admin: null; reason: "signed_out" | "not_allowed" };

// Checks the session and, in the database, that it belongs to the
// allowlisted GitHub account, so changing ADMIN_GITHUB_ID shuts out old
// sessions straight away.
const checkAdmin = cache(async (): Promise<Check> => {
  // Read the request first: during the build this waits for a real request,
  // so Better Auth is never set up while prerendering.
  const requestHeaders = await headers();
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session) return { admin: null, reason: "signed_out" };

  const [github] = await db
    .select({ id: account.id })
    .from(account)
    .where(
      and(
        eq(account.userId, session.user.id),
        eq(account.providerId, "github"),
        eq(account.accountId, adminGithubId()),
      ),
    );
  if (!github) return { admin: null, reason: "not_allowed" };

  return { admin: { name: session.user.name, email: session.user.email } };
});

/**
 * The signed-in admin, or a redirect to the login page. Every admin page,
 * data read and server action calls this itself: the proxy's cookie check
 * and the layouts only decide what to show, they don't protect anything.
 */
export async function requireAdmin(): Promise<Admin> {
  const check = await checkAdmin();
  if (check.admin) return check.admin;
  redirect(check.reason === "not_allowed" ? "/admin/login?error=not_allowed" : "/admin/login");
}

/** The signed-in admin, or null. For route handlers, which answer with an error instead of a redirect. */
export async function getAdmin(): Promise<Admin | null> {
  return (await checkAdmin()).admin;
}
