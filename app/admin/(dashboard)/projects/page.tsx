import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import StatusBadge from "@/components/admin/StatusBadge";
import { localeLabels } from "@/i18n/routing";
import { moveProject } from "@/modules/projects/actions";
import { missingLocales } from "@/modules/projects/schema";
import { getProjects } from "@/modules/projects/service";

export const metadata: Metadata = { title: "Projects" };

const moveStyle =
  "flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition hover:border-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-30";

async function ProjectList() {
  const projects = await getProjects();
  if (!projects.length) {
    return <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">No projects yet.</p>;
  }

  return (
    <ol className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {projects.map((project, i) => {
        const title = project.translations.en.title || project.slug;
        const missing = missingLocales(project.translations);
        return (
          <li key={project.id} className={`flex flex-wrap items-center gap-x-4 gap-y-3 p-4 ${project.status === "archived" ? "opacity-60" : ""}`}>
            {/* Order on the site (only published projects are shown) */}
            <div className="flex gap-1">
              <form action={moveProject.bind(null, project.id, "up")}>
                <button type="submit" disabled={i === 0} aria-label={`Move ${title} up`} className={moveStyle}>
                  ↑
                </button>
              </form>
              <form action={moveProject.bind(null, project.id, "down")}>
                <button type="submit" disabled={i === projects.length - 1} aria-label={`Move ${title} down`} className={moveStyle}>
                  ↓
                </button>
              </form>
            </div>

            <span aria-hidden className="h-8 w-8 shrink-0 rounded-lg ring-1 ring-foreground/10" style={{ background: project.color }} />
            {/* On a phone the title gets its own line; status and Edit wrap below. */}
            <div className="min-w-0 flex-1 basis-40">
              <p className="font-medium [overflow-wrap:anywhere]">{title}</p>
              <p className="truncate font-mono text-xs text-muted">{project.slug}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={project.status} />
              {missing.map((locale) => (
                <span key={locale} className="text-xs text-amber-400">
                  {localeLabels[locale].short} text missing
                </span>
              ))}
            </div>
            <Link
              href={`/admin/projects/${project.id}/edit`}
              className="inline-flex min-h-9 items-center rounded-full border border-line px-4 text-sm transition hover:border-foreground"
            >
              Edit<span className="sr-only"> {title}</span>
            </Link>
          </li>
        );
      })}
    </ol>
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
