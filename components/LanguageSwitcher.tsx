"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, routing, type Locale } from "@/i18n/routing";

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
    </svg>
  );
}

// Where to put the reader back after switching language. The whole page
// remounts in the new language (the locale is the root layout's segment), and
// translations change section heights, so a raw scroll position would land
// somewhere else. Instead, remember the section crossing the middle of the
// screen and how far through it the reader is.
type Spot = { id: string; progress: number };
let pendingRestore: { spot: Spot | null; scrollY: number } | null = null;

function captureSpot(): Spot | null {
  const middle = window.innerHeight / 2;
  for (const section of document.querySelectorAll<HTMLElement>(
    "main section[id]:not(#home)",
  )) {
    const rect = section.getBoundingClientRect();
    if (rect.top <= middle && rect.bottom > middle) {
      return { id: section.id, progress: (middle - rect.top) / rect.height };
    }
  }
  return null;
}

function restoreSpot() {
  if (!pendingRestore) return;
  const { spot, scrollY } = pendingRestore;
  pendingRestore = null;
  // Let the remounted hero measure its pinned scroll first; a refresh would
  // otherwise move the page again after this.
  ScrollTrigger.refresh();
  let top = scrollY;
  const section = spot && document.getElementById(spot.id);
  if (section) {
    const rect = section.getBoundingClientRect();
    top =
      window.scrollY +
      rect.top +
      spot.progress * rect.height -
      window.innerHeight / 2;
  }
  window.scrollTo({ top, behavior: "instant" });
}

/**
 * Switches language in place: the reader stays at the same spot on the page,
 * and the current #section and ?query are kept. Each option is a real link,
 * so it also works before the page's JavaScript has loaded.
 */
function useSwitchLocale(onSwitch?: () => void) {
  const router = useRouter();
  const pathname = usePathname();
  const current = useLocale();
  const [pending, startTransition] = useTransition();

  // Once the page has re-rendered in the new language (and its fonts are
  // ready), scroll back to the remembered spot.
  useEffect(() => {
    if (!pendingRestore) return;
    let frame = 0;
    document.fonts.ready.then(() => {
      frame = requestAnimationFrame(restoreSpot);
    });
    return () => cancelAnimationFrame(frame);
  }, [current]);

  const switchTo = (event: React.MouseEvent, locale: Locale) => {
    // Let modified clicks (new tab, etc.) behave like a normal link, and
    // leave this tab's menu as it is.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    onSwitch?.();
    event.preventDefault();
    if (locale === current) return;
    const { search, hash } = window.location;
    pendingRestore = { spot: captureSpot(), scrollY: window.scrollY };
    startTransition(() => {
      router.replace(`${pathname}${search}${hash}`, { locale, scroll: false });
    });
  };

  return { current, pathname, pending, switchTo };
}

/** Desktop navigation: a button that opens the list of languages. */
export function LanguageMenu({
  onOpenChange,
}: {
  onOpenChange?: (open: boolean) => void;
}) {
  const t = useTranslations("Language");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const { current, pathname, pending, switchTo } = useSwitchLocale(() =>
    setOpen(false),
  );

  // While open: focus the current language, move with the arrow keys, and
  // close on Escape, a click outside, or when focus leaves.
  useEffect(() => onOpenChange?.(open), [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const items = () =>
      Array.from(
        listRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [],
      );
    items()
      .find((item) => item.getAttribute("aria-current"))
      ?.focus({ preventScroll: true });

    const onKey = (event: KeyboardEvent) => {
      const list = items();
      const index = list.indexOf(document.activeElement as HTMLAnchorElement);
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const step = event.key === "ArrowDown" ? 1 : -1;
        list[(index + step + list.length) % list.length]?.focus();
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        list[event.key === "Home" ? 0 : list.length - 1]?.focus();
      }
    };
    const onOutside = (event: Event) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("focusin", onOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("focusin", onOutside);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={t("change", { language: localeLabels[current].name })}
        aria-expanded={open}
        aria-controls={listId}
        aria-busy={pending}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-10 items-center gap-1.5 rounded-full border px-3 text-sm transition hover:border-accent/60 hover:text-foreground ${
          open ? "border-accent/60 text-foreground" : "border-line text-muted"
        } ${pending ? "opacity-60" : ""}`}
      >
        <GlobeIcon />
        <span lang={current}>{localeLabels[current].short}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute top-full right-0 mt-3 w-52 origin-top-right overflow-hidden rounded-2xl border border-line bg-background p-1.5 shadow-2xl shadow-black/30"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-12 -right-10 h-28 w-28 rounded-full bg-accent/20 blur-3xl"
            />
            <ul
              ref={listRef}
              id={listId}
              aria-label={t("label")}
              className="relative"
            >
              {routing.locales.map((locale) => {
                const selected = locale === current;
                return (
                  <li key={locale}>
                    <Link
                      href={pathname}
                      locale={locale}
                      lang={locale}
                      hrefLang={locale}
                      scroll={false}
                      aria-current={selected ? "true" : undefined}
                      onClick={(event) => switchTo(event, locale)}
                      className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition focus-visible:outline-offset-[-2px] ${
                        selected
                          ? "bg-accent/15 text-foreground"
                          : "text-muted hover:bg-foreground/5 hover:text-foreground"
                      }`}
                    >
                      <span aria-hidden className="text-base">
                        {localeLabels[locale].flag}
                      </span>
                      <span className="flex-1">
                        {localeLabels[locale].name}
                      </span>
                      {selected && <CheckIcon />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-accent"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** Mobile menu: both languages side by side as a segmented toggle. */
export function LanguageToggle({ onSwitch }: { onSwitch?: () => void }) {
  const t = useTranslations("Language");
  const id = useId();
  const { current, pathname, pending, switchTo } = useSwitchLocale(onSwitch);

  return (
    <div>
      <p
        id={`${id}-label`}
        className="mb-2.5 font-mono text-xs tracking-widest text-muted uppercase"
      >
        {t("label")}
      </p>
      <ul
        aria-labelledby={`${id}-label`}
        aria-busy={pending}
        className="grid grid-cols-2 gap-1 rounded-full border border-line bg-surface p-1"
      >
        {routing.locales.map((locale) => {
          const selected = locale === current;
          return (
            <li key={locale}>
              <Link
                href={pathname}
                locale={locale}
                lang={locale}
                hrefLang={locale}
                scroll={false}
                aria-current={selected ? "true" : undefined}
                onClick={(event) => switchTo(event, locale)}
                className={`relative flex min-h-11 items-center justify-center gap-2 rounded-full text-sm transition-colors ${
                  selected
                    ? "text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId={`${id}-language`}
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-accent/15 ring-1 ring-accent/50"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span aria-hidden className="relative">
                  {localeLabels[locale].flag}
                </span>
                <span className="relative">{localeLabels[locale].name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
