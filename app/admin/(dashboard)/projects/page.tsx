import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import OrderedList from "@/components/admin/OrderedList";
import { moveProject } from "@/modules/projects/actions";
import { missingLocales } from "@/modules/projects/schema";
import { getProjects } from "@/modules/projects/service";

export const metadata: Metadata = { title: "Projects" };

async function ProjectList() {
  const projects = await getProjects();
  return (
    <OrderedList
      move={moveProject}
      empty="No projects yet."
      items={projects.map((project) => ({
        id: project.id,
        title: project.translations.en.title || project.slug,
        subtitle: project.slug,
        status: project.status,
        missing: missingLocales(project.translations),
        swatch: project.color,
        editHref: `/admin/projects/${project.id}/edit`,
      }))}
    />
  );
}

export default function ProjectsPage() {
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h3 font-semibold">Projects</h1>
          <p className="mt-1 text-sm text-muted">Published projects are shown on the site in this order.</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex min-h-11 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition hover:bg-accent"
        >
          New project
        </Link>
      </div>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl border border-line bg-surface" />}>
        <ProjectList />
      </Suspense>
    </>
  );
}
