import Image from "next/image";
import { site, type Project } from "@/content/site";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const initials = (title: string) =>
  title
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

function ProjectLogo({ project }: { project: Project }) {
  if (project.logo) {
    return (
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white shadow-lg shadow-black/30 ring-1 ring-white/10">
        <Image
          src={project.logo}
          alt={`${project.title} logo`}
          fill
          sizes="64px"
          className="object-contain"
        />
      </div>
    );
  }
  return (
    <div
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-semibold text-white shadow-lg shadow-black/30 ring-1 ring-white/10"
      style={{ background: `linear-gradient(135deg, ${project.color}, ${project.color}99)` }}
      aria-hidden
    >
      {initials(project.title)}
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-32">
      <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading eyebrow="Projects" title="Selected work" className="" />
        <Reveal delay={0.05}>
          <p className="max-w-sm leading-relaxed text-muted md:text-right">
            {site.projectsIntro}
          </p>
        </Reveal>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {site.projects.map((project, i) => (
          <Reveal key={project.title} delay={(i % 2) * 0.1} className="h-full">
            <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white/[0.02] p-7 transition duration-300 hover:-translate-y-1 hover:border-white/15 sm:p-8">
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
                <ProjectLogo project={project} />
                <span className="rounded-full border border-line bg-background/40 px-3 py-1 text-xs text-muted backdrop-blur">
                  {project.type}
                </span>
              </div>

              <p className="relative mt-8 font-mono text-xs tracking-widest text-muted uppercase">
                {project.context}
              </p>
              <h3 className="relative mt-2 text-2xl font-semibold tracking-tight">
                {project.title}
              </h3>
              <p className="relative mt-3 leading-relaxed text-muted">
                {project.description}
              </p>

              {project.image && (
                <div className="relative mt-6 aspect-video overflow-hidden rounded-xl border border-line">
                  <Image
                    src={project.image}
                    alt={`Screenshot of ${project.title}`}
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
                      className="rounded-full bg-white/5 px-2.5 py-1 font-mono text-xs text-muted transition group-hover:text-foreground"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
                {(project.href || project.repo) && (
                  <div className="mt-5 flex gap-5 text-sm">
                    {project.href && (
                      <a href={project.href} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                        Live site ↗
                      </a>
                    )}
                    {project.repo && (
                      <a href={project.repo} target="_blank" rel="noreferrer" className="text-muted hover:text-foreground">
                        Source ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
