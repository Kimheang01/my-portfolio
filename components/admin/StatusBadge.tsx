import type { ContentStatus } from "@/modules/admin/validation";

const styles: Record<ContentStatus, string> = {
  published: "border-emerald-400/40 bg-emerald-400/10 text-emerald-400",
  draft: "border-amber-400/40 bg-amber-400/10 text-amber-400",
  archived: "border-line text-muted",
};

const labels: Record<ContentStatus, string> = {
  published: "Published",
  draft: "Draft",
  archived: "Archived",
};

export default function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
