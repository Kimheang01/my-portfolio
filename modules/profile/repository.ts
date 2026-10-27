// Database reads and writes for the profile (a single row, id 1). No
// permission checks here: only service.ts calls these, after requireAdmin().
import "server-only";
import { db } from "@/db";
import { profile, profileTranslations } from "@/db/schema";
import { routing, type Locale } from "@/i18n/routing";
import type { ProfileData } from "./schema";

export type AdminProfile = {
  name: string;
  email: string;
  photoMediaId: number | null;
  translations: Record<Locale, ProfileData["translations"][Locale]>;
};

const emptyText: ProfileData["translations"][Locale] = {
  role: "",
  location: "",
  heroRoles: [],
  heroIntroHeading: "",
  heroIntroText: "",
  heroStatement: "",
  aboutParagraphs: [],
  spokenLanguages: [],
};

export async function getProfile(): Promise<AdminProfile> {
  const row = await db.query.profile.findFirst({
    with: { translations: true },
  });
  const translations = Object.fromEntries(
    routing.locales.map((locale) => {
      const t = row?.translations.find((text) => text.locale === locale);
      if (!t) return [locale, emptyText];
      return [
        locale,
        {
          role: t.role,
          location: t.location,
          heroRoles: t.heroRoles,
          heroIntroHeading: t.heroIntroHeading,
          heroIntroText: t.heroIntroText,
          heroStatement: t.heroStatement,
          aboutParagraphs: t.aboutParagraphs,
          spokenLanguages: t.spokenLanguages,
        },
      ];
    }),
  ) as AdminProfile["translations"];
  return { name: row?.name ?? "", email: row?.email ?? "", photoMediaId: row?.photoMediaId ?? null, translations };
}

export async function saveProfile(data: ProfileData) {
  await db.transaction(async (tx) => {
    // Creates the row on an empty database, otherwise updates it.
    const values = { name: data.name, email: data.email, photoMediaId: data.photoMediaId };
    await tx
      .insert(profile)
      .values({ id: 1, ...values })
      .onConflictDoUpdate({ target: profile.id, set: values });
    for (const locale of routing.locales) {
      const text = data.translations[locale];
      await tx
        .insert(profileTranslations)
        .values({ profileId: 1, locale, ...text })
        .onConflictDoUpdate({ target: [profileTranslations.profileId, profileTranslations.locale], set: text });
    }
  });
}
