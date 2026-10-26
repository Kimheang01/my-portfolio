import type { Metadata } from "next";
import { Suspense } from "react";
import { getContentCounts } from "@/modules/admin/overview";

export const metadata: Metadata = { title: "Overview" };

const cardStyle = "rounded-2xl border border-line bg-surface p-5";

async function Summary() {
  const counts = await getContentCounts();
  const cards = [
    { label: "Projects", value: counts.projectsTotal },
    { label: "Published projects", value: counts.projectsPublished },
    { label: "Skills", value: counts.skillsTotal },
    { label: "Experience entries", value: counts.experienceTotal },
  ];

  return (
    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className={cardStyle}>
          <dt className="text-sm text-muted">{card.label}</dt>
          <dd className="mt-2 text-3xl font-semibold tabular-nums">{card.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SummarySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-hidden>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className={`${cardStyle} h-[6.5rem] animate-pulse`} />
      ))}
    </div>
  );
}

export default function OverviewPage() {
  return (
    <>
      <h1 className="text-h3 font-semibold">Overview</h1>
      <p className="mt-1 mb-8 text-sm text-muted">What&apos;s on the site right now.</p>
      <Suspense fallback={<SummarySkeleton />}>
        <Summary />
      </Suspense>
    </>
  );
}
