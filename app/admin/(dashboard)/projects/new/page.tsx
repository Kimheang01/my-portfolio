import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ProjectEditor from "@/components/admin/projects/ProjectEditor";
import { requireAdmin } from "@/lib/authorization";
import { saveProject } from "@/modules/projects/actions";
import { getCardLabels, newProject } from "@/modules/projects/editor";

export const metadata: Metadata = { title: "New project" };

async function Editor() {
  await requireAdmin();
  return <ProjectEditor project={newProject} action={saveProject.bind(null, null)} cardLabels={await getCardLabels()} />;
}

export default function NewProjectPage() {
  return (
    <>
      <Link href="/admin/projects" className="text-sm text-muted hover:text-foreground">
        ← Projects
      </Link>
      <h1 className="mt-3 mb-8 text-h3 font-semibold">New project</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl border border-line bg-surface" />}>
        <Editor />
      </Suspense>
    </>
  );
}
