"use client";

import { useEffect, useState } from "react";

type Status = "idle" | "copied" | "failed";

export default function CopyEmailButton({
  email,
  labels,
}: {
  email: string;
  /** Translated on the server by Contact */
  labels: { copy: string; copied: string; failed: string };
}) {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (status === "idle") return;
    const id = setTimeout(() => setStatus("idle"), status === "failed" ? 4000 : 2000);
    return () => clearTimeout(id);
  }, [status]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setStatus("copied");
    } catch {
      // Clipboard access can be blocked; the Email me button still works.
      setStatus("failed");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-medium transition hover:border-foreground active:bg-foreground/10"
      >
        {status === "copied" ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-emerald-400" aria-hidden>
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {labels.copied}
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {labels.copy}
          </>
        )}
      </button>
      {/* Announces the result to screen readers; also shows the failure text. */}
      <p role="status" className={status === "failed" ? "basis-full text-sm text-muted" : "sr-only"}>
        {status === "copied" ? labels.copied : status === "failed" ? labels.failed : ""}
      </p>
    </>
  );
}
