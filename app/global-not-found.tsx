import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import InlineScript from "@/components/InlineScript";
import { fontVariables } from "@/lib/fonts";
import { DEFAULT_ACCENT, DEFAULT_MODE, themeCss, themeInitScript } from "@/lib/theme";

// Shown for URLs that match no page, including unsupported languages such
// as /fr. It renders outside the [locale] layout, so it shows both languages.
export const metadata: Metadata = {
  title: "404 — Page not found",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      data-theme={DEFAULT_MODE}
      data-accent={DEFAULT_ACCENT}
      className={`${fontVariables} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss() }} />
        <InlineScript html={themeInitScript} />
      </head>
      <body>
        <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
          <p className="font-mono text-sm tracking-widest text-accent">404</p>
          <h1 className="text-h2 font-semibold tracking-tight">
            Page not found
            <span lang="km" className="mt-3 block text-h3 font-medium text-muted">
              រកមិនឃើញទំព័រនេះទេ
            </span>
          </h1>
          {/* "/" redirects to the visitor's saved language. */}
          <Link
            href="/"
            className="inline-flex min-h-12 items-center rounded-full border border-accent/40 bg-accent/10 px-6 text-sm font-medium transition hover:border-accent hover:bg-accent/20"
          >
            Back to home · <span lang="km">&nbsp;ត្រឡប់ទៅទំព័រដើម</span>
          </Link>
        </main>
      </body>
    </html>
  );
}
