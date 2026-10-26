import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import SkillGroupEditor from "@/components/admin/skills/SkillGroupEditor";
import { deleteSkillGroup, saveSkillGroup } from "@/modules/skills/actions";
import { getSkillGroup } from "@/modules/skills/service";

export const metadata: Metadata = { title: "Edit skill group" };

async function Editor({ params, searchParams }: PageProps<"/admin/skills/[id]/edit">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const group = await getSkillGroup(id);
  if (!group) notFound();
  const created = (await searchParams).created === "1";

  return (
    <>
      <h1 className="mt-3 mb-8 text-h3 font-semibold">{group.names.en}</h1>
      {created && (
        <p role="status" className="mb-6 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm">
          Group created. It&apos;s on the site now.
        </p>
      )}
      {/* key: a different group starts a fresh form */}
      <SkillGroupEditor
        key={group.id}
        group={group}
        action={saveSkillGroup.bind(null, group.id)}
        remove={deleteSkillGroup.bind(null, group.id)}
      />
    </>
  );
}

export default function EditSkillGroupPage(props: PageProps<"/admin/skills/[id]/edit">) {
  return (
    <>
      <Link href="/admin/skills" className="text-sm text-muted hover:text-foreground">
        ← Skills
      </Link>
      {/* The id comes from the URL, so this part waits for the request. */}
      <Suspense fallback={<div className="mt-3 h-96 animate-pulse rounded-2xl border border-line bg-surface" />}>
        <Editor {...props} />
      </Suspense>
    </>
  );
}
