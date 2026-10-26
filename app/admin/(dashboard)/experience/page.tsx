import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import OrderedList from "@/components/admin/OrderedList";
import { moveExperience } from "@/modules/experience/actions";
import { missingLocales } from "@/modules/experience/schema";
import { getExperience } from "@/modules/experience/service";
import { toEditorExperience } from "@/modules/experience/editor";

export const metadata: Metadata = { title: "Experience" };

async function ExperienceList() {
  const entries = await getExperience();
  return (
    <OrderedList
      move={moveExperience}
      empty="No experience yet."
      items={entries.map((entry) => ({
        id: entry.id,
        title: entry.translations.en.title || entry.organization,
        subtitle: `${entry.kind === "education" ? "Education · " : ""}${entry.organization} · ${entry.start} – ${entry.end ?? "now"}`,
        status: entry.status,
        missing: missingLocales(toEditorExperience(entry).translations),
        editHref: `/admin/experience/${entry.id}/edit`,
      }))}
    />
  );
}

export default function ExperiencePage() {
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h3 font-semibold">Experience</h1>
          <p className="mt-1 text-sm text-muted">Jobs and education. Published entries are shown on the site in this order.</p>
        </div>
        <Link
          href="/admin/experience/new"
          className="inline-flex min-h-11 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition hover:bg-accent"
        >
          New entry
        </Link>
      </div>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl border border-line bg-surface" />}>
        <ExperienceList />
      </Suspense>
    </>
  );
}
