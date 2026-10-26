// The experience editor's starting values.
import "server-only";
import type { EditorExperience } from "@/components/admin/experience/ExperienceEditor";
import { routing, type Locale } from "@/i18n/routing";
import type { AdminExperience } from "./service";

const blank = { title: "", highlights: "", description: "" };

export const newExperience: EditorExperience = {
  status: "new",
  slug: "",
  kind: "work",
  organization: "",
  start: "",
  end: "",
  tags: "",
  translations: Object.fromEntries(routing.locales.map((locale) => [locale, blank])) as Record<Locale, typeof blank>,
};

export function toEditorExperience(entry: AdminExperience): EditorExperience {
  return {
    status: entry.status,
    slug: entry.slug,
    kind: entry.kind,
    organization: entry.organization,
    start: entry.start,
    end: entry.end ?? "",
    tags: entry.tags.join(", "),
    translations: Object.fromEntries(
      routing.locales.map((locale) => {
        const t = entry.translations[locale];
        return [locale, { title: t.title, highlights: t.highlights.join("\n"), description: t.description }];
      }),
    ) as EditorExperience["translations"],
  };
}
