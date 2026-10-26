import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import SkillGroupEditor, { type EditorSkillGroup } from "@/components/admin/skills/SkillGroupEditor";
import { routing, type Locale } from "@/i18n/routing";
import { requireAdmin } from "@/lib/authorization";
import { saveSkillGroup } from "@/modules/skills/actions";

export const metadata: Metadata = { title: "New skill group" };

const blank = () => Object.fromEntries(routing.locales.map((locale) => [locale, ""])) as Record<Locale, string>;

async function Editor() {
  await requireAdmin();
  const group: EditorSkillGroup = { icon: "tools", names: blank(), skills: [{ names: blank() }] };
  return <SkillGroupEditor group={group} action={saveSkillGroup.bind(null, null)} />;
}

export default function NewSkillGroupPage() {
  return (
    <>
      <Link href="/admin/skills" className="text-sm text-muted hover:text-foreground">
        ← Skills
      </Link>
      <h1 className="mt-3 mb-8 text-h3 font-semibold">New skill group</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl border border-line bg-surface" />}>
        <Editor />
      </Suspense>
    </>
  );
}
