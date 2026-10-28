// Portfolio content. Text shown to visitors lives in a *_translations table
// with one row per language; everything that reads the same in every
// language (names, dates, links, tags, colors) is on the main table.
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
} from "drizzle-orm/pg-core";
import { timestamps } from "./columns";
import { media } from "./media";

// Must list the same languages as i18n/routing.ts. The seed script fails to
// type-check if a language is missing here.
export const localeEnum = pgEnum("locale", ["en", "km"]);

export const contentStatusEnum = pgEnum("content_status", ["draft", "published", "archived"]);

/** "education" entries are shown with an education label in the timeline */
export const experienceKindEnum = pgEnum("experience_kind", ["work", "education"]);

/** The platforms components/SocialIcon.tsx has an icon for */
export const socialPlatformEnum = pgEnum("social_platform", [
  "LinkedIn",
  "Instagram",
  "Telegram",
  "GitHub",
]);

/** The skill group icons drawn in components/About.tsx */
export const skillIconEnum = pgEnum("skill_icon", [
  "frontend",
  "backend",
  "mobile",
  "databases",
  "tools",
]);

const locale = () => localeEnum().notNull();
const translatedText = () => text().notNull().default("");
const textList = () => text().array().notNull().default(sql`'{}'::text[]`);

// ── Profile ─────────────────────────────────────────────────────────────

// A single row: the person the portfolio is about.
export const profile = pgTable(
  "profile",
  {
    id: integer().primaryKey().default(1),
    email: text().notNull(),
    photoMediaId: integer().references(() => media.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [check("profile_single_row", sql`${t.id} = 1`)],
);

export type HeroRole = { first: string; second: string };

export const profileTranslations = pgTable(
  "profile_translations",
  {
    profileId: integer()
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    locale: locale(),
    name: translatedText(),
    role: translatedText(),
    location: translatedText(),
    /** The rotating headline in the hero, e.g. "Full-Stack" / "Developer" */
    heroRoles: jsonb().$type<HeroRole[]>().notNull().default([]),
    heroIntroHeading: translatedText(),
    heroIntroText: translatedText(),
    heroStatement: translatedText(),
    aboutParagraphs: textList(),
    spokenLanguages: textList(),
  },
  (t) => [primaryKey({ columns: [t.profileId, t.locale] })],
);

// ── Site settings ───────────────────────────────────────────────────────

// A single row of site-wide settings.
export const siteSettings = pgTable(
  "site_settings",
  {
    id: integer().primaryKey().default(1),
    ...timestamps,
  },
  (t) => [check("site_settings_single_row", sql`${t.id} = 1`)],
);

export const siteSettingsTranslations = pgTable(
  "site_settings_translations",
  {
    settingsId: integer()
      .notNull()
      .references(() => siteSettings.id, { onDelete: "cascade" }),
    locale: locale(),
    /** The page <title> and the title shown when a link is shared */
    metaTitle: translatedText(),
    metaDescription: translatedText(),
  },
  (t) => [primaryKey({ columns: [t.settingsId, t.locale] })],
);

// ── Social links ────────────────────────────────────────────────────────

export const socials = pgTable(
  "socials",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    platform: socialPlatformEnum().notNull().unique(),
    href: text().notNull(),
    handle: text(),
    visible: boolean().notNull().default(true),
    sortOrder: integer().notNull().default(0),
    ...timestamps,
  },
  (t) => [check("socials_href_https", sql`${t.href} ~ '^https://'`)],
);

// ── Skills ──────────────────────────────────────────────────────────────

export const skillCategories = pgTable("skill_categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  key: text().notNull().unique(),
  icon: skillIconEnum().notNull(),
  sortOrder: integer().notNull().default(0),
  ...timestamps,
});

export const skillCategoryTranslations = pgTable(
  "skill_category_translations",
  {
    categoryId: integer()
      .notNull()
      .references(() => skillCategories.id, { onDelete: "cascade" }),
    locale: locale(),
    name: translatedText(),
  },
  (t) => [primaryKey({ columns: [t.categoryId, t.locale] })],
);

export const skills = pgTable(
  "skills",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    categoryId: integer()
      .notNull()
      .references(() => skillCategories.id, { onDelete: "cascade" }),
    sortOrder: integer().notNull().default(0),
    ...timestamps,
  },
  (t) => [index().on(t.categoryId, t.sortOrder)],
);

// Technology names usually read the same in both languages, but some skills
// are described in words ("RESTful API design"), so each has a name per language.
export const skillTranslations = pgTable(
  "skill_translations",
  {
    skillId: integer()
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    locale: locale(),
    name: translatedText(),
  },
  (t) => [primaryKey({ columns: [t.skillId, t.locale] })],
);

// ── Experience and education ────────────────────────────────────────────

export const experiences = pgTable(
  "experiences",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    slug: text().notNull().unique(),
    kind: experienceKindEnum().notNull().default("work"),
    organization: text().notNull(),
    /** "YYYY-MM" */
    startMonth: text().notNull(),
    /** "YYYY-MM"; empty for the current role */
    endMonth: text(),
    tags: textList(),
    status: contentStatusEnum().notNull().default("draft"),
    sortOrder: integer().notNull().default(0),
    ...timestamps,
  },
  (t) => [
    // Lowercase words joined by hyphens, e.g. "bs-express".
    check("experiences_slug_format", sql`${t.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
    check("experiences_start_month_format", sql`${t.startMonth} ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'`),
    check(
      "experiences_end_month_format",
      sql`${t.endMonth} is null or (${t.endMonth} ~ '^[0-9]{4}-(0[1-9]|1[0-2])$' and ${t.endMonth} >= ${t.startMonth})`,
    ),
    index().on(t.status, t.sortOrder),
  ],
);

export const experienceTranslations = pgTable(
  "experience_translations",
  {
    experienceId: integer()
      .notNull()
      .references(() => experiences.id, { onDelete: "cascade" }),
    locale: locale(),
    /** Job title, or the program for an education entry */
    title: translatedText(),
    highlights: textList(),
    description: translatedText(),
  },
  (t) => [primaryKey({ columns: [t.experienceId, t.locale] })],
);

// ── Projects ────────────────────────────────────────────────────────────

export const projects = pgTable(
  "projects",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    slug: text().notNull().unique(),
    status: contentStatusEnum().notNull().default("draft"),
    featured: boolean().notNull().default(false),
    sortOrder: integer().notNull().default(0),
    /** Brand color for the card's glow, as "#rrggbb" (the card adds alpha digits) */
    color: text().notNull(),
    /** Letters shown when there's no logo, e.g. "SE" */
    monogram: text(),
    logoMediaId: integer().references(() => media.id, { onDelete: "set null" }),
    imageMediaId: integer().references(() => media.id, { onDelete: "set null" }),
    href: text(),
    repo: text(),
    tags: textList(),
    ...timestamps,
  },
  (t) => [
    // Lowercase words joined by hyphens, e.g. "bs-one".
    check("projects_slug_format", sql`${t.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
    check("projects_color_format", sql`${t.color} ~ '^#[0-9a-fA-F]{6}$'`),
    check("projects_href_https", sql`${t.href} is null or ${t.href} ~ '^https://'`),
    check("projects_repo_https", sql`${t.repo} is null or ${t.repo} ~ '^https://'`),
    index().on(t.status, t.sortOrder),
  ],
);

export const projectTranslations = pgTable(
  "project_translations",
  {
    projectId: integer()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    locale: locale(),
    title: translatedText(),
    /** e.g. "iOS & Android app" */
    type: translatedText(),
    /** Where and when, e.g. "BS Express · 2026" */
    context: translatedText(),
    description: translatedText(),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.locale] })],
);
