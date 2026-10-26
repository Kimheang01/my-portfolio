import Link from "next/link";
import StatusBadge from "./StatusBadge";
import { localeLabels, type Locale } from "@/i18n/routing";
import type { ContentStatus } from "@/modules/admin/validation";

export type ListItem = {
  id: number;
  title: string;
  subtitle: string;
  status?: ContentStatus;
  /** Languages with text still missing */
  missing?: Locale[];
  /** A colored square before the title, e.g. a project's brand color */
  swatch?: string;
  editHref: string;
};

const moveStyle =
  "flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition hover:border-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-30";

/**
 * The admin's lists (projects, experience, skill groups), in the order the
 * site shows them, with ↑ ↓ buttons that call the section's move action.
 */
export default function OrderedList({
  items,
  move,
  empty,
}: {
  items: ListItem[];
  move: (id: number, direction: "up" | "down") => Promise<void>;
  empty: string;
}) {
  if (!items.length) {
    return <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">{empty}</p>;
  }

  return (
    <ol className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {items.map((item, i) => (
        <li
          key={item.id}
          className={`flex flex-wrap items-center gap-x-4 gap-y-3 p-4 ${item.status === "archived" ? "opacity-60" : ""}`}
        >
          <div className="flex gap-1">
            <form action={move.bind(null, item.id, "up")}>
              <button type="submit" disabled={i === 0} aria-label={`Move ${item.title} up`} className={moveStyle}>
                ↑
              </button>
            </form>
            <form action={move.bind(null, item.id, "down")}>
              <button type="submit" disabled={i === items.length - 1} aria-label={`Move ${item.title} down`} className={moveStyle}>
                ↓
              </button>
            </form>
          </div>

          {item.swatch && (
            <span aria-hidden className="h-8 w-8 shrink-0 rounded-lg ring-1 ring-foreground/10" style={{ background: item.swatch }} />
          )}
          {/* On a phone the title gets its own line; status and Edit wrap below. */}
          <div className="min-w-0 flex-1 basis-40">
            <p className="font-medium [overflow-wrap:anywhere]">{item.title}</p>
            <p className="truncate text-xs text-muted">{item.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {item.status && <StatusBadge status={item.status} />}
            {item.missing?.map((locale) => (
              <span key={locale} className="text-xs text-amber-400">
                {localeLabels[locale].short} text missing
              </span>
            ))}
          </div>
          <Link
            href={item.editHref}
            className="inline-flex min-h-9 items-center rounded-full border border-line px-4 text-sm transition hover:border-foreground"
          >
            Edit<span className="sr-only"> {item.title}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
