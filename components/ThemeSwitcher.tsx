"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ACCENTS, MODES, type ModePreference } from "@/lib/theme";
import { setAccent, setMode, useTheme } from "@/lib/use-theme";

const icons: Record<ModePreference, React.ReactNode> = {
  dark: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
  light: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </>
  ),
  system: (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
};

function Icon({ children, className = "h-4 w-4" }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

const legend = "font-mono text-xs tracking-widest text-muted uppercase";

/**
 * Mode and accent pickers. Both are native radio groups (visually hidden
 * inputs inside styled labels), so Tab, the arrow keys and screen readers
 * work as they do for any radio buttons. Used in the desktop popover and in
 * the mobile menu.
 */
export function ThemeControls() {
  const t = useTranslations("Theme");
  const id = useId();
  const { mode, resolved, accent } = useTheme();

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className={`mb-2.5 ${legend}`}>{t("mode")}</legend>
        <div className="grid grid-cols-3 gap-1 rounded-full border border-line bg-surface p-1">
          {MODES.map((option) => {
            const checked = mode === option.id;
            return (
              <label
                key={option.id}
                className={`relative flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                  checked ? "text-foreground" : "text-muted hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name={`${id}-mode`}
                  value={option.id}
                  checked={checked}
                  onChange={() => setMode(option.id)}
                  className="sr-only"
                />
                {checked && (
                  <motion.span
                    layoutId={`${id}-mode`}
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-accent/15 ring-1 ring-accent/50"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="relative">
                  <Icon>{icons[option.id]}</Icon>
                </span>
                <span className="relative">{t(`modes.${option.id}`)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className={`mb-2.5 flex w-full items-center justify-between ${legend}`}>
          {t("accent")}
          <span className="font-sans text-xs tracking-normal text-foreground normal-case">
            {t(`accents.${accent}`)}
          </span>
        </legend>
        <div className="grid grid-cols-6 gap-1">
          {ACCENTS.map((option) => {
            const checked = accent === option.id;
            // Show the shade actually used in the current mode.
            const swatch = resolved === "light" ? option.light : option.dark;
            return (
              <label
                key={option.id}
                title={t(`accents.${option.id}`)}
                className="group flex aspect-square min-h-10 cursor-pointer items-center justify-center rounded-full"
              >
                <input
                  type="radio"
                  name={`${id}-accent`}
                  value={option.id}
                  checked={checked}
                  onChange={() => setAccent(option.id)}
                  className="sr-only"
                />
                <span className="sr-only">{t(`accents.${option.id}`)}</span>
                <span
                  aria-hidden
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-background ring-offset-2 ring-offset-background transition duration-200 group-hover:scale-110 group-has-[:focus-visible]:outline-2 group-has-[:focus-visible]:outline-offset-4 group-has-[:focus-visible]:outline-foreground ${
                    checked ? "ring-2 ring-(color:--swatch) shadow-[0_0_16px_var(--swatch)]" : ""
                  }`}
                  style={{ background: swatch, "--swatch": swatch } as React.CSSProperties}
                >
                  {checked && (
                    <Icon className="h-4 w-4">
                      <path d="M20 6 9 17l-5-5" strokeWidth="2.5" />
                    </Icon>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

/** Desktop navigation: a button that opens the theme controls in a popover. */
export default function ThemeSwitcher({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const t = useTranslations("Theme");

  // While open: close on Escape (returning focus to the button), on a click
  // outside, or when focus moves elsewhere on the page.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLInputElement>("input:checked")?.focus({ preventScroll: true });

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      onOpenChange(false);
      buttonRef.current?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onOpenChange(false);
    };
    const onFocus = (event: FocusEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("focusin", onFocus);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={t("settings")}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onOpenChange(!open)}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition hover:border-accent/60 hover:text-foreground ${
          open ? "border-accent/60 text-foreground" : "border-line text-muted"
        }`}
      >
        <Icon className="h-[18px] w-[18px]">
          <path d="M12 2a10 10 0 0 0 0 20c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.12-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.97 6.01 17.46 2 12 2Z" />
          <circle cx="7.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="10.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="15.5" cy="7.5" r=".5" fill="currentColor" />
        </Icon>
        <span
          aria-hidden
          className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label={t("settings")}
            className="absolute top-full right-0 mt-3 w-80 origin-top-right overflow-hidden rounded-2xl border border-line bg-background p-4 shadow-2xl shadow-black/30"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-12 h-36 w-36 rounded-full bg-accent/20 blur-3xl"
            />
            <div className="relative">
              <p className="mb-4 text-sm font-medium">{t("appearance")}</p>
              <ThemeControls />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
