// Copies the portfolio content in scripts/seed-data/ into the database. It
// only adds what's missing: a profile, project, job, skill group or link
// that's already in the database (for example, edited in the admin
// dashboard) is left as it is, so it's safe to run again.
// Run: yarn db:seed
import fs from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import { routing, type Locale } from "@/i18n/routing";
import { createDb, databaseUrl, type Database } from "@/db/client";
import * as t from "@/db/schema";
import en from "./seed-data/en.json";
import km from "./seed-data/km.json";
import { site } from "./seed-data/site";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

const messages = { en, km } satisfies Record<Locale, typeof en>;
const locales = routing.locales;

// "bsOne" → "bs-one"
const toSlug = (id: string) => id.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const mimeTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

type Tally = Record<string, number>;

const count = (tally: Tally, what: string) => {
  tally[what] = (tally[what] ?? 0) + 1;
};

const summary = (tally: Tally) =>
  Object.entries(tally)
    .map(([what, n]) => `${n} ${what}`)
    .join(", ") || "nothing";

async function seed(db: Database, added: Tally, kept: Tally) {
  await db.transaction(async (tx) => {
    // Images in /public, by their path. Returns the media row's id.
    async function localMedia(url: string | undefined) {
      if (!url) return null;
      const file = path.join(process.cwd(), "public", url);
      const mimeType = mimeTypes[path.extname(url).toLowerCase()];
      if (!mimeType) throw new Error(`Unsupported image type: ${url}`);
      await tx
        .insert(t.media)
        .values({ storageKey: url, url, mimeType, sizeBytes: fs.statSync(file).size })
        .onConflictDoNothing({ target: t.media.storageKey });
      const [row] = await tx.select({ id: t.media.id }).from(t.media).where(eq(t.media.storageKey, url));
      return row.id;
    }

    // Profile
    if ((await tx.select().from(t.profile)).length) count(kept, "profile");
    else {
      await tx.insert(t.profile).values({
        email: site.email,
        photoMediaId: await localMedia(site.photo),
      });
      await tx.insert(t.profileTranslations).values(
        locales.map((locale) => {
          const m = messages[locale];
          return {
            profileId: 1,
            locale,
            name: m.Common.name,
            role: m.Common.role,
            location: m.Common.location,
            heroRoles: m.Hero.roles,
            heroIntroHeading: m.Hero.introHeading,
            heroIntroText: m.Hero.introText,
            heroStatement: m.Hero.statement,
            aboutParagraphs: m.About.paragraphs,
            spokenLanguages: m.About.spokenLanguages,
          };
        }),
      );
      count(added, "profile");
    }

    // Site settings
    if ((await tx.select().from(t.siteSettings)).length) count(kept, "site settings");
    else {
      await tx.insert(t.siteSettings).values({});
      await tx.insert(t.siteSettingsTranslations).values(
        locales.map((locale) => ({
          settingsId: 1,
          locale,
          metaTitle: messages[locale].Metadata.title,
          metaDescription: messages[locale].Metadata.description,
        })),
      );
      count(added, "site settings");
    }

    // Social links. A link with an empty href is hidden on the site, so it's skipped.
    for (const [sortOrder, social] of site.socials.entries()) {
      if (!social.href) continue;
      const [row] = await tx
        .insert(t.socials)
        .values({ platform: social.label, href: social.href, handle: social.handle, sortOrder })
        .onConflictDoNothing({ target: t.socials.platform })
        .returning({ id: t.socials.id });
      count(row ? added : kept, "social links");
    }

    // Skill groups and their skills
    for (const [sortOrder, key] of site.skills.entries()) {
      const [existing] = await tx
        .select({ id: t.skillCategories.id })
        .from(t.skillCategories)
        .where(eq(t.skillCategories.key, key));
      if (existing) {
        count(kept, "skill groups");
        continue;
      }
      const [category] = await tx
        .insert(t.skillCategories)
        .values({ key, icon: key, sortOrder })
        .returning({ id: t.skillCategories.id });
      await tx.insert(t.skillCategoryTranslations).values(
        locales.map((locale) => ({
          categoryId: category.id,
          locale,
          name: messages[locale].About.skills[key].name,
        })),
      );
      // Items are matched across languages by position, so every language
      // lists the same number of items.
      for (const [index] of messages.en.About.skills[key].items.entries()) {
        const [skill] = await tx
          .insert(t.skills)
          .values({ categoryId: category.id, sortOrder: index })
          .returning({ id: t.skills.id });
        await tx.insert(t.skillTranslations).values(
          locales.map((locale) => ({
            skillId: skill.id,
            locale,
            name: messages[locale].About.skills[key].items[index],
          })),
        );
      }
      count(added, "skill groups");
    }

    // Experience and education
    for (const [sortOrder, job] of site.experience.entries()) {
      const slug = toSlug(job.id);
      const [existing] = await tx
        .select({ id: t.experiences.id })
        .from(t.experiences)
        .where(eq(t.experiences.slug, slug));
      if (existing) {
        count(kept, "experience entries");
        continue;
      }
      const [row] = await tx
        .insert(t.experiences)
        .values({
          slug,
          kind: job.kind ?? "work",
          organization: job.company,
          startMonth: job.start,
          endMonth: job.end,
          tags: job.tags ?? [],
          status: "published",
          sortOrder,
        })
        .returning({ id: t.experiences.id });
      await tx.insert(t.experienceTranslations).values(
        locales.map((locale) => {
          // Jobs list highlights; the education entry has a description.
          const item: { title: string; highlights?: string[]; description?: string } =
            messages[locale].Experience.items[job.id];
          return {
            experienceId: row.id,
            locale,
            title: item.title,
            highlights: item.highlights ?? [],
            description: item.description ?? "",
          };
        }),
      );
      count(added, "experience entries");
    }

    // Projects
    for (const [sortOrder, project] of site.projects.entries()) {
      const slug = toSlug(project.id);
      const [existing] = await tx
        .select({ id: t.projects.id })
        .from(t.projects)
        .where(eq(t.projects.slug, slug));
      if (existing) {
        count(kept, "projects");
        continue;
      }
      const [row] = await tx
        .insert(t.projects)
        .values({
          slug,
          status: "published",
          sortOrder,
          color: project.color,
          monogram: project.monogram,
          logoMediaId: await localMedia(project.logo),
          imageMediaId: await localMedia(project.image),
          href: project.href,
          repo: project.repo,
          tags: project.tags,
        })
        .returning({ id: t.projects.id });
      await tx.insert(t.projectTranslations).values(
        locales.map((locale) => {
          const item = messages[locale].Projects.items[project.id];
          return {
            projectId: row.id,
            locale,
            title: item.title,
            type: item.type,
            context: item.context,
            description: item.description,
          };
        }),
      );
      count(added, "projects");
    }
  });
}

async function main() {
  const { db, client } = createDb(databaseUrl(), { max: 1 });
  const added: Tally = {};
  const kept: Tally = {};
  try {
    await seed(db, added, kept);
  } finally {
    await client.end();
  }
  console.log(`Added: ${summary(added)}.`);
  console.log(`Already in the database (left unchanged): ${summary(kept)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
