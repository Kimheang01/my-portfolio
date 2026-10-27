"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Sections of the admin.
const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/experience", label: "Experience" },
  { href: "/admin/skills", label: "Skills" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/settings", label: "Links & SEO" },
  { href: "/admin/media", label: "Media" },
] as const;

// A section stays highlighted on its sub-pages, e.g. /admin/projects/3/edit.
const isCurrent = (href: string, pathname: string) =>
  href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

function NavList({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Admin">
      <ul className="flex flex-wrap gap-1 md:flex-col">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={pathname && isCurrent(link.href, pathname) ? "page" : undefined}
              className="flex min-h-10 items-center rounded-xl px-3 text-sm text-muted transition hover:bg-foreground/5 hover:text-foreground aria-[current]:bg-accent/10 aria-[current]:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
        <li className="md:mt-2 md:border-t md:border-line md:pt-2">
          {/* The site has its own root layout, so this loads a new page. */}
          <Link
            href="/"
            className="flex min-h-10 items-center rounded-xl px-3 text-sm text-muted transition hover:bg-foreground/5 hover:text-foreground"
          >
            View site ↗
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default function AdminNav() {
  return <NavList pathname={usePathname()} />;
}

/** The same links before the URL is known (pages with an [id] in it). */
export function AdminNavFallback() {
  return <NavList pathname={null} />;
}
