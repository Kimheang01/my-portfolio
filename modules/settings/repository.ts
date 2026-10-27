// Database reads and writes for social links and SEO settings. No
// permission checks here: only service.ts calls these, after requireAdmin().
import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings, siteSettingsTranslations, socials } from "@/db/schema";
import { routing, type Locale } from "@/i18n/routing";
import { SOCIAL_PLATFORMS, type SettingsData, type SocialPlatform } from "./schema";

export type AdminSettings = {
  /** Every platform, saved ones first in their order, then the rest */
  socials: { platform: SocialPlatform; href: string; handle: string; visible: boolean }[];
  seo: Record<Locale, { title: string; description: string }>;
};

export async function getSettings(): Promise<AdminSettings> {
  const [rows, seoRows] = await Promise.all([
    db.select().from(socials).orderBy(asc(socials.sortOrder), asc(socials.id)),
    db.select().from(siteSettingsTranslations).where(eq(siteSettingsTranslations.settingsId, 1)),
  ]);
  const saved = rows.map((row) => ({ platform: row.platform, href: row.href, handle: row.handle ?? "", visible: row.visible }));
  const unsaved = SOCIAL_PLATFORMS.filter((p) => !saved.some((s) => s.platform === p)).map((platform) => ({
    platform,
    href: "",
    handle: "",
    visible: true,
  }));
  const seo = Object.fromEntries(
    routing.locales.map((locale) => {
      const row = seoRows.find((r) => r.locale === locale);
      return [locale, { title: row?.metaTitle ?? "", description: row?.metaDescription ?? "" }];
    }),
  ) as AdminSettings["seo"];
  return { socials: [...saved, ...unsaved], seo };
}

export async function saveSettings(data: SettingsData) {
  await db.transaction(async (tx) => {
    for (const [sortOrder, social] of data.socials.entries()) {
      if (!social.href) {
        await tx.delete(socials).where(eq(socials.platform, social.platform));
        continue;
      }
      const values = { href: social.href, handle: social.handle, visible: social.visible, sortOrder };
      await tx
        .insert(socials)
        .values({ platform: social.platform, ...values })
        .onConflictDoUpdate({ target: socials.platform, set: values });
    }

    // The single settings row, created on an empty database.
    await tx.insert(siteSettings).values({ id: 1 }).onConflictDoNothing();
    for (const locale of routing.locales) {
      const seo = { metaTitle: data.seo[locale].title, metaDescription: data.seo[locale].description };
      await tx
        .insert(siteSettingsTranslations)
        .values({ settingsId: 1, locale, ...seo })
        .onConflictDoUpdate({
          target: [siteSettingsTranslations.settingsId, siteSettingsTranslations.locale],
          set: seo,
        });
    }
  });
}
