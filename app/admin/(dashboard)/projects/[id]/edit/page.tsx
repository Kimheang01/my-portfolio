import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ProjectEditor from "@/components/admin/projects/ProjectEditor";
import StatusBadge from "@/components/admin/StatusBadge";
import { routing } from "@/i18n/routing";
import { getMediaLibrary } from "@/modules/media/service";
import { saveProject } from "@/modules/projects/actions";
import { getCardLabels, toEditorProject } from "@/modules/projects/editor";
import { getProject } from "@/modules/projects/service";

export const metadata: Metadata = { title: "Edit project" };

async function Editor({ params, searchParams }: PageProps<"/admin/projects/[id]/edit">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const project = await getProject(id);
  if (!project) notFound();
  const created = (await searchParams).created === "1";

  return (
    <>
      <div className="mt-3 mb-8 flex flex-wrap items-center gap-3">
        <h1 className="text-h3 font-semibold">{project.translations.en.title || project.slug}</h1>
        <StatusBadge status={project.status} />
        {project.status === "published" && (
          <a href={`/${routing.defaultLocale}#projects`} className="text-sm text-muted hover:text-foreground">
            View on site ↗
          </a>
        )}
      </div>
      {created && project.status === "draft" && (
        <p role="status" className="mb-6 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm">
          Project created as a draft. Publish it when both languages are filled in.
        </p>
      )}
      {/* key: a different project starts a fresh form */}
      <ProjectEditor
        key={project.id}
        project={toEditorProject(project)}
        action={saveProject.bind(null, project.id)}
        cardLabels={await getCardLabels()}
        media={await getMediaLibrary()}
      />
    </>
  );
}

export default function EditProjectPage(props: PageProps<"/admin/projects/[id]/edit">) {
  return (
    <>
      <Link href="/admin/projects" className="text-sm text-muted hover:text-foreground">
        ← Projects
      </Link>
      {/* The id comes from the URL, so this part waits for the request. */}
      <Suspense fallback={<div className="mt-3 h-96 animate-pulse rounded-2xl border border-line bg-surface" />}>
        <Editor {...props} />
      </Suspense>
    </>
  );
}
