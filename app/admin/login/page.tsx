import type { Metadata } from "next";
import { Suspense } from "react";
import LoginError from "@/components/admin/LoginError";
import SubmitButton from "@/components/admin/SubmitButton";
import { signIn } from "@/lib/auth-actions";

export const metadata: Metadata = { title: "Sign in" };

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl"
        />
        <div className="relative">
          <p className="font-mono text-xs tracking-widest text-accent uppercase">Admin</p>
          <h1 className="mt-3 text-h3 font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-muted">
            Only the site owner&apos;s GitHub account can sign in.
          </p>
          {/* Reads ?error= from the URL, which isn't known until the request. */}
          <Suspense>
            <LoginError />
          </Suspense>
          <form action={signIn} className="mt-6">
            <SubmitButton pendingLabel="Opening GitHub…">
              <GitHubIcon />
              Sign in with GitHub
            </SubmitButton>
          </form>
        </div>
      </div>
    </main>
  );
}
