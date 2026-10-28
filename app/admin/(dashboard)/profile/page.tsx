import type { Metadata } from "next";
import { Suspense } from "react";
import ProfileEditor from "@/components/admin/profile/ProfileEditor";
import { routing, type Locale } from "@/i18n/routing";
import type { ProfileText } from "@/modules/profile/schema";
import { getMediaLibrary } from "@/modules/media/service";
import { saveProfile } from "@/modules/profile/actions";
import { getProfile } from "@/modules/profile/service";

export const metadata: Metadata = { title: "Profile" };

async function Editor() {
  const [profile, media] = await Promise.all([getProfile(), getMediaLibrary()]);
  // Lists are edited as text: paragraphs with blank lines between, languages one per line.
  const translations = Object.fromEntries(
    routing.locales.map((locale) => {
      const t = profile.translations[locale];
      return [
        locale,
        { ...t, aboutParagraphs: t.aboutParagraphs.join("\n\n"), spokenLanguages: t.spokenLanguages.join("\n") },
      ];
    }),
  ) as Record<Locale, ProfileText>;

  return (
    <ProfileEditor
      profile={{ email: profile.email, photoMediaId: profile.photoMediaId, translations }}
      media={media}
      action={saveProfile}
    />
  );
}

export default function ProfilePage() {
  return (
    <>
      <h1 className="text-h3 font-semibold">Profile</h1>
      <p className="mt-1 mb-8 text-sm text-muted">Your name, the hero and the About section. Saved changes are on the site straight away.</p>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl border border-line bg-surface" />}>
        <Editor />
      </Suspense>
    </>
  );
}
