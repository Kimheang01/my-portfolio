"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./auth";

/** Sends the browser to GitHub; GitHub sends it back to /admin. */
export async function signIn() {
  const { url } = await getAuth().api.signInSocial({
    body: { provider: "github", callbackURL: "/admin", errorCallbackURL: "/admin/login" },
    headers: await headers(),
  });
  if (!url) throw new Error("Better Auth returned no GitHub sign-in URL.");
  redirect(url);
}

/** Ends the session in the database and clears the cookie. */
export async function signOut() {
  await getAuth().api.signOut({ headers: await headers() });
  redirect("/admin/login");
}
