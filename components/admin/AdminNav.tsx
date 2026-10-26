"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Sections of the admin. Later phases add Projects, Profile, Skills, …
const links = [{ href: "/admin", label: "Overview" }] as const;

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin">
      <ul className="flex gap-1 md:flex-col">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
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
