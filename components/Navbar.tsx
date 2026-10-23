"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/content/site";

const links = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

const ease = [0.22, 1, 0.36, 1] as const;

// Three bars that fold into an X while the menu is open.
function MenuIcon({ open }: { open: boolean }) {
  const bar = "absolute left-0 h-[1.5px] w-full rounded-full bg-current transition-all duration-300 ease-out";
  return (
    <span aria-hidden className="relative block h-3.5 w-5">
      <span className={`${bar} ${open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"}`} />
      <span className={`${bar} top-1/2 -translate-y-1/2 ${open ? "scale-x-0 opacity-0" : ""}`} />
      <span className={`${bar} ${open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"}`} />
    </span>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While open: close on Escape, or when the screen grows to the desktop layout.
  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia("(min-width: 768px)");
    const close = () => setOpen(false);
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    const onChange = () => desktop.matches && close();
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onChange);
    };
  }, [open]);

  return (
    <>
      {/* Tapping outside the open menu closes it */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            aria-hidden
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled || open
            ? "border-b border-line bg-background/80 backdrop-blur-md"
            : "border-b border-transparent"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="#home" className="font-semibold tracking-tight" onClick={() => setOpen(false)}>
            {site.name}
          </a>

          <ul className="hidden gap-8 text-sm text-muted md:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition hover:text-foreground">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-foreground transition active:bg-white/10 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <MenuIcon open={open} />
          </button>
        </nav>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="menu"
              id="mobile-menu"
              className="overflow-hidden md:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease }}
            >
              <ul className="flex flex-col px-6 pt-2 pb-8">
                {links.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 + i * 0.05, ease }}
                  >
                    <a
                      href={link.href}
                      className="flex items-center justify-between border-b border-line py-4 text-2xl font-medium tracking-tight transition active:text-accent"
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                      <span aria-hidden className="text-base text-muted">
                        0{i + 1}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
