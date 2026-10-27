"use client";

// Shown in place of an admin page when something fails while loading it,
// for example the database being unreachable. The sidebar and header stay.
// In production the message never includes the error's details, only an id
// to find it in the server logs.
export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div role="alert" className="max-w-lg rounded-2xl border border-rose-400/40 bg-rose-400/10 p-6">
      <h1 className="text-h3 font-semibold">This page couldn&apos;t load</h1>
      <p className="mt-2 text-sm text-muted">
        Nothing was changed. Try again; if it keeps happening, check the server logs
        {error.digest ? (
          <>
            {" "}
            for error <code className="font-mono text-foreground">{error.digest}</code>
          </>
        ) : null}
        .
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-5 inline-flex min-h-11 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition hover:bg-accent"
      >
        Try again
      </button>
    </div>
  );
}
