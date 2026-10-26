import { useTranslations } from "next-intl";
import type { Project } from "@/modules/portfolio/types";
import ProjectCard from "./ProjectCard";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Projects({ projects }: { projects: Project[] }) {
  const t = useTranslations("Projects");
  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-20 sm:py-28 lg:py-32">
      <div className="mb-10 flex flex-col gap-5 sm:mb-12 md:flex-row md:items-end md:justify-between md:gap-6">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} className="" />
        <Reveal delay={0.05}>
          <p className="max-w-sm text-body text-muted md:text-right">
            {t("intro")}
          </p>
        </Reveal>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project, i) => (
          <Reveal key={project.slug} delay={(i % 2) * 0.1} className="h-full">
            <ProjectCard
              project={project}
              labels={{
                liveSite: t("liveSite"),
                source: t("source"),
                logoAlt: t("logoAlt", { title: project.title }),
                screenshotAlt: t("screenshotAlt", { title: project.title }),
              }}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
