import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ExperienceEditor from "@/components/admin/experience/ExperienceEditor";
import { requireAdmin } from "@/lib/authorization";
import { saveExperience } from "@/modules/experience/actions";
import { newExperience } from "@/modules/experience/editor";

export const metadata: Metadata = { title: "New entry" };

async function Editor() {
  await requireAdmin();
  return <ExperienceEditor entry={newExperience} action={saveExperience.bind(null, null)} />;
}

export default function NewExperiencePage() {
  return (
    <>
      <Link href="/admin/experience" className="text-sm text-muted hover:text-foreground">
        ← Experience
      </Link>
      <h1 className="mt-3 mb-8 text-h3 font-semibold">New entry</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl border border-line bg-surface" />}>
        <Editor />
      </Suspense>
    </>
  );
}
