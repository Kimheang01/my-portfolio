// Reads the content the public site shows. Only published experience and
// projects, and only visible social links, are returned.
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import type { Locale } from "@/i18n/routing";
import type { Portfolio } from "./types";

/** Tag on every cached read of public content; admin changes invalidate it. */
export const PORTFOLIO_TAG = "portfolio";

/**
 * Everything on the home page, in one language. Cached until an admin
 * change invalidates PORTFOLIO_TAG, so pages stay static and the database
 * is only read when the content changes.
 */
export async function getPortfolio(locale: Locale): Promise<Portfolio> {
  "use cache";
  cacheTag(PORTFOLIO_TAG);
  cacheLife("max");

  const [profile, settings, socials, categories, experiences, projects] = await Promise.all([
    db.query.profile.findFirst({
      with: {
        photo: { columns: { url: true } },
        translations: { where: (t, { eq }) => eq(t.locale, locale) },
      },
    }),
    db.query.siteSettingsTranslations.findFirst({
      where: (t, { eq }) => eq(t.locale, locale),
    }),
    db.query.socials.findMany({
      where: (t, { eq }) => eq(t.visible, true),
      orderBy: (t, { asc }) => [asc(t.sortOrder), asc(t.id)],
    }),
    db.query.skillCategories.findMany({
      orderBy: (t, { asc }) => [asc(t.sortOrder), asc(t.id)],
      with: {
        translations: { where: (t, { eq }) => eq(t.locale, locale) },
        skills: {
          orderBy: (t, { asc }) => [asc(t.sortOrder), asc(t.id)],
          with: { translations: { where: (t, { eq }) => eq(t.locale, locale) } },
        },
      },
    }),
    db.query.experiences.findMany({
      where: (t, { eq }) => eq(t.status, "published"),
      orderBy: (t, { asc }) => [asc(t.sortOrder), asc(t.id)],
      with: { translations: { where: (t, { eq }) => eq(t.locale, locale) } },
    }),
    db.query.projects.findMany({
      where: (t, { eq }) => eq(t.status, "published"),
      orderBy: (t, { asc }) => [asc(t.sortOrder), asc(t.id)],
      with: {
        logo: { columns: { url: true } },
        image: { columns: { url: true } },
        translations: { where: (t, { eq }) => eq(t.locale, locale) },
      },
    }),
  ]);

  const profileText = profile?.translations[0];
  if (!profile || !profileText) {
    throw new Error(`The database has no profile in "${locale}". Run yarn db:seed.`);
  }

  // Items without text in this language are left out rather than shown blank.
  return {
    profile: {
      name: profileText.name,
      email: profile.email,
      photo: profile.photo?.url ?? null,
      role: profileText.role,
      location: profileText.location,
      heroRoles: profileText.heroRoles,
      heroIntroHeading: profileText.heroIntroHeading,
      heroIntroText: profileText.heroIntroText,
      heroStatement: profileText.heroStatement,
      aboutParagraphs: profileText.aboutParagraphs,
      spokenLanguages: profileText.spokenLanguages,
    },
    seo: {
      title: settings?.metaTitle ?? "",
      description: settings?.metaDescription ?? "",
    },
    socials: socials.map(({ platform, href, handle }) => ({ platform, href, handle })),
    skillGroups: categories.flatMap(({ key, icon, translations: [text], skills }) =>
      text
        ? [
            {
              key,
              icon,
              name: text.name,
              skills: skills.flatMap(({ translations: [skill] }) => (skill ? [skill.name] : [])),
            },
          ]
        : [],
    ),
    experience: experiences.flatMap(({ translations: [text], ...job }) =>
      text
        ? [
            {
              slug: job.slug,
              kind: job.kind,
              organization: job.organization,
              start: job.startMonth,
              end: job.endMonth,
              tags: job.tags,
              title: text.title,
              highlights: text.highlights,
              description: text.description,
            },
          ]
        : [],
    ),
    projects: projects.flatMap(({ translations: [text], ...project }) =>
      text
        ? [
            {
              slug: project.slug,
              color: project.color,
              monogram: project.monogram,
              logo: project.logo?.url ?? null,
              image: project.image?.url ?? null,
              href: project.href,
              repo: project.repo,
              tags: project.tags,
              title: text.title,
              type: text.type,
              context: text.context,
              description: text.description,
            },
          ]
        : [],
    ),
  };
}
