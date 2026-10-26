import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import OrderedList from "@/components/admin/OrderedList";
import { moveSkillGroup } from "@/modules/skills/actions";
import { getSkillGroups } from "@/modules/skills/service";

export const metadata: Metadata = { title: "Skills" };

async function GroupList() {
  const groups = await getSkillGroups();
  return (
    <OrderedList
      move={moveSkillGroup}
      empty="No skill groups yet."
      items={groups.map((group) => ({
        id: group.id,
        title: group.names.en,
        subtitle: group.skills.map((skill) => skill.names.en).join(", ") || "No skills yet",
        editHref: `/admin/skills/${group.id}/edit`,
      }))}
    />
  );
}

export default function SkillsPage() {
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h3 font-semibold">Skills</h1>
          <p className="mt-1 text-sm text-muted">Groups are shown in the About section in this order.</p>
        </div>
        <Link
          href="/admin/skills/new"
          className="inline-flex min-h-11 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition hover:bg-accent"
        >
          New group
        </Link>
      </div>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl border border-line bg-surface" />}>
        <GroupList />
      </Suspense>
    </>
  );
}
