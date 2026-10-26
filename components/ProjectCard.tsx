import Image from "next/image";
import type { Project } from "@/modules/portfolio/types";

/** The card's interface text, already translated (see Projects.tsx). */
export type ProjectCardLabels = {
  liveSite: string;
  source: string;
  logoAlt: string;
  screenshotAlt: string;
};

const initials = (title: string) =>
  title
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

function ProjectLogo({ project, alt }: { project: Project; alt: string }) {
  if (project.logo) {
    return (
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-white sm:h-16 sm:w-16 shadow-lg shadow-black/30 ring-1 ring-foreground/10">
        <Image
          src={project.logo}
          alt={alt}
          fill
          sizes="64px"
          className="object-contain"
        />
      </div>
    );
  }
  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg sm:h-16 sm:w-16 sm:text-xl font-semibold text-white shadow-lg shadow-black/30 ring-1 ring-foreground/10"
      style={{ background: `linear-gradient(135deg, ${project.color}, ${project.color}99)` }}
      aria-hidden
    >
      {project.monogram ?? initials(project.title)}
    </div>
  );
}

// One project in the Projects grid, in one language. It takes its text as
// props, so the admin editor can also show it as a live preview.
export default function ProjectCard({
  project,
  labels,
}: {
  project: Project;
  labels: ProjectCardLabels;
}) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface p-5 transition duration-300 hover:-translate-y-1 hover:border-foreground/15 min-[400px]:p-7 sm:p-8">
      {/* Brand-colored glow, brighter on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(110% 70% at 100% 0%, ${project.color}38, transparent 60%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-10 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${project.color}, transparent)`,
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <ProjectLogo project={project} alt={labels.logoAlt} />
        <span className="rounded-full border border-line bg-background/40 px-3 py-1 text-center text-xs text-muted backdrop-blur">
          {project.type}
        </span>
      </div>

      <p className="relative mt-6 font-mono text-xs tracking-widest text-muted uppercase sm:mt-8">
        {project.context}
      </p>
      <h3 className="relative mt-2 text-card font-semibold tracking-tight">
        {project.title}
      </h3>
      <p className="relative mt-3 text-body text-muted">
        {project.description}
      </p>

      {project.image && (
        <div className="relative mt-6 aspect-video overflow-hidden rounded-xl border border-line">
          <Image
            src={project.image}
            alt={labels.screenshotAlt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="relative mt-auto pt-6">
        <ul className="flex flex-wrap gap-2 border-t border-line pt-5">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-foreground/5 px-2.5 py-1 font-mono text-xs text-muted transition group-hover:text-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
        {(project.href || project.repo) && (
          <div className="mt-3 flex gap-5 text-sm">
            {project.href && (
              <a href={project.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-accent hover:underline">
                {labels.liveSite} ↗
              </a>
            )}
            {project.repo && (
              <a href={project.repo} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-muted hover:text-foreground">
                {labels.source} ↗
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
