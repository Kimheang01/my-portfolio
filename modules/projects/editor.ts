// What the project editor needs from the server, besides the action.
import "server-only";
import { getTranslations } from "next-intl/server";
import type { EditorProject } from "@/components/admin/projects/ProjectEditor";
import type { ProjectCardLabels } from "@/components/ProjectCard";
import { routing, type Locale } from "@/i18n/routing";
import type { AdminProject } from "./service";

/** The public card's interface text in each language, for the preview. */
export async function getCardLabels(): Promise<Record<Locale, ProjectCardLabels>> {
  const entries = await Promise.all(
    routing.locales.map(async (locale) => {
      const t = await getTranslations({ locale, namespace: "Projects" });
      const labels: ProjectCardLabels = {
        liveSite: t("liveSite"),
        source: t("source"),
        // Left as "{title} logo": the editor fills in the title as you type.
        logoAlt: t.raw("logoAlt") as string,
        screenshotAlt: t.raw("screenshotAlt") as string,
      };
      return [locale, labels] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<Locale, ProjectCardLabels>;
}

const blankText = { title: "", type: "", context: "", description: "" };

export const newProject: EditorProject = {
  status: "new",
  slug: "",
  color: "#8b7cff",
  monogram: "",
  href: "",
  repo: "",
  tags: "",
  logoMediaId: null,
  imageMediaId: null,
  translations: Object.fromEntries(routing.locales.map((locale) => [locale, blankText])) as Record<
    Locale,
    typeof blankText
  >,
};

export function toEditorProject(project: AdminProject): EditorProject {
  return {
    status: project.status,
    slug: project.slug,
    color: project.color,
    monogram: project.monogram ?? "",
    href: project.href ?? "",
    repo: project.repo ?? "",
    tags: project.tags.join(", "),
    logoMediaId: project.logoMediaId,
    imageMediaId: project.imageMediaId,
    translations: project.translations,
  };
}
