import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ExperienceEditor from "@/components/admin/experience/ExperienceEditor";
import StatusBadge from "@/components/admin/StatusBadge";
import { routing } from "@/i18n/routing";
import { saveExperience } from "@/modules/experience/actions";
import { toEditorExperience } from "@/modules/experience/editor";
import { getExperienceEntry } from "@/modules/experience/service";

export const metadata: Metadata = { title: "Edit entry" };

async function Editor({ params, searchParams }: PageProps<"/admin/experience/[id]/edit">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const entry = await getExperienceEntry(id);
  if (!entry) notFound();
  const created = (await searchParams).created === "1";

  return (
    <>
      <div className="mt-3 mb-8 flex flex-wrap items-center gap-3">
        <h1 className="text-h3 font-semibold">{entry.translations.en.title || entry.organization}</h1>
        <StatusBadge status={entry.status} />
        {entry.status === "published" && (
          <a href={`/${routing.defaultLocale}#experience`} className="text-sm text-muted hover:text-foreground">
            View on site ↗
          </a>
        )}
      </div>
      {created && entry.status === "draft" && (
        <p role="status" className="mb-6 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm">
          Entry created as a draft. Publish it when both languages are filled in.
        </p>
      )}
      {/* key: a different entry starts a fresh form */}
      <ExperienceEditor key={entry.id} entry={toEditorExperience(entry)} action={saveExperience.bind(null, entry.id)} />
    </>
  );
}

export default function EditExperiencePage(props: PageProps<"/admin/experience/[id]/edit">) {
  return (
    <>
      <Link href="/admin/experience" className="text-sm text-muted hover:text-foreground">
        ← Experience
      </Link>
      {/* The id comes from the URL, so this part waits for the request. */}
      <Suspense fallback={<div className="mt-3 h-96 animate-pulse rounded-2xl border border-line bg-surface" />}>
        <Editor {...props} />
      </Suspense>
    </>
  );
}
