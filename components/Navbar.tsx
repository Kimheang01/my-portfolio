"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { site } from "@/content/site";
import { LanguageMenu, LanguageToggle } from "./LanguageSwitcher";
import ThemeSwitcher, { ThemeControls } from "./ThemeSwitcher";

// Section anchors on the page; labels are translated under Nav.
const links = [
  { href: "#about", key: "about" },
  { href: "#experience", key: "experience" },
  { href: "#projects", key: "projects" },
  { href: "#contact", key: "contact" },
] as const;

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
  const t = useTranslations("Nav");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  // Over the dark hero the bar is transparent, so it stays dark there; once
  // it gets a background it follows the chosen theme.
  const solid = scrolled || open || themeOpen || languageOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the link of the section crossing the middle of the screen.
  useEffect(() => {
    const sections = links
      .map((link) => document.querySelector<HTMLElement>(link.href))
      .filter((section): section is HTMLElement => section !== null);
    const crossing = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const href = `#${entry.target.id}`;
          if (entry.isIntersecting) crossing.add(href);
          else crossing.delete(href);
        }
        setActive(links.find((link) => crossing.has(link.href))?.href ?? null);
      },
      // A zero-height line across the middle of the screen.
      { rootMargin: "-50% 0px -50% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
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
        data-theme={solid ? undefined : "dark"}
        className={`fixed inset-x-0 top-0 z-50 text-foreground transition-colors duration-300 ${
          solid ? "border-b border-line bg-background/80 backdrop-blur-md" : "border-b border-transparent"
        }`}
      >
        <nav aria-label={t("label")} className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="#home" className="font-semibold tracking-tight" onClick={() => setOpen(false)}>
            {site.name}
          </a>

          <div className="hidden items-center gap-6 md:flex lg:gap-8">
            <ul className="flex gap-6 text-sm text-muted lg:gap-8">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={active === link.href ? "location" : undefined}
                    className="relative py-2 transition hover:text-foreground aria-[current]:text-foreground after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-accent after:shadow-[0_0_8px_var(--accent)] after:transition-transform after:duration-300 aria-[current]:after:scale-x-100"
                  >
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2">
              <LanguageMenu onOpenChange={setLanguageOpen} />
              <ThemeSwitcher open={themeOpen} onOpenChange={setThemeOpen} />
            </div>
          </div>

          <button
            type="button"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-foreground transition active:bg-foreground/10 md:hidden"
            aria-label={open ? t("closeMenu") : t("openMenu")}
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
              {/* Scrolls on its own when taller than a short (landscape) screen */}
              <div
                data-lenis-prevent
                className="max-h-[calc(100svh-4rem)] overflow-y-auto overscroll-contain"
              >
                <ul className="flex flex-col px-6 pt-2">
                  {links.map((link, i) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.05 + i * 0.05, ease }}
                    >
                      <a
                        href={link.href}
                        aria-current={active === link.href ? "location" : undefined}
                        className="group flex items-center justify-between border-b border-line py-4 text-2xl font-medium tracking-tight transition active:text-accent aria-[current]:text-accent"
                        onClick={() => setOpen(false)}
                      >
                        {t(link.key)}
                        <span aria-hidden className="text-base text-muted group-aria-[current]:text-accent">
                          0{i + 1}
                        </span>
                      </a>
                    </motion.li>
                  ))}
                </ul>
                <motion.div
                  className="px-6 pt-7 pb-8"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 + links.length * 0.05, ease }}
                >
                  <div className="space-y-5">
                    <LanguageToggle onSwitch={() => setOpen(false)} />
                    <ThemeControls />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
