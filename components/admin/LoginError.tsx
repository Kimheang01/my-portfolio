"use client";

import { useSearchParams } from "next/navigation";

// Better Auth sends GitHub sign-in failures back as ?error=<code>.
const messages: Record<string, string> = {
  not_allowed: "This GitHub account isn't allowed to sign in. Sign in with the site owner's account.",
  access_denied: "Sign-in was cancelled on GitHub.",
};

export default function LoginError() {
  const error = useSearchParams().get("error");
  if (!error) return null;

  return (
    <p role="alert" className="mt-5 rounded-2xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm">
      {messages[error] ?? "Sign-in didn't work. Please try again."}
    </p>
  );
}
