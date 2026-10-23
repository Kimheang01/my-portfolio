import Image from "next/image";
import { site } from "@/content/site";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-32">
      <SectionHeading eyebrow="Projects" title="Selected work" />

      <div className="grid gap-6 md:grid-cols-2">
        {site.projects.map((project, i) => (
          <Reveal key={project.title} delay={(i % 2) * 0.1}>
            <article className="group h-full overflow-hidden rounded-2xl border border-line bg-white/[0.02] transition hover:border-accent/50">
              <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-accent/30 via-accent/5 to-transparent">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={`Screenshot of ${project.title}`}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : project.logo ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative h-28 w-28 overflow-hidden rounded-[22%] bg-white shadow-2xl shadow-black/40 ring-1 ring-white/10 transition duration-500 group-hover:scale-105">
                      <Image
                        src={project.logo}
                        alt={`${project.title} logo`}
                        fill
                        sizes="112px"
                        className="object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-6xl font-semibold text-foreground/10">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold">{project.title}</h3>
                <p className="mt-2 text-muted">{project.description}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full bg-white/5 px-2.5 py-1 font-mono text-xs text-muted"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
                {(project.href || project.repo) && (
                  <div className="mt-6 flex gap-5 text-sm">
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
