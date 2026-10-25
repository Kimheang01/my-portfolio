// Theme configuration: every color the site uses comes from here. The CSS
// variables are generated from these values (see `themeCss`), so to tweak a
// color or add an accent preset, edit this file only.

export type Mode = "dark" | "light";
/** What the visitor picked: a fixed mode, or follow the device setting. */
export type ModePreference = Mode | "system";

// Labels are translated under Theme.modes in the message files.
export const MODES: { id: ModePreference }[] = [{ id: "dark" }, { id: "light" }, { id: "system" }];

/** Neutral colors for each mode. Dark is the original black theme. */
export const PALETTES: Record<Mode, Record<string, string>> = {
  dark: {
    background: "#000000",
    foreground: "#ededf0",
    muted: "#9a9aa8",
    line: "rgb(255 255 255 / 0.09)",
    surface: "rgb(255 255 255 / 0.02)",
    "surface-hover": "rgb(255 255 255 / 0.04)",
  },
  light: {
    background: "#f7f7f8",
    foreground: "#0b0b10",
    muted: "#5b5b6b",
    line: "rgb(0 0 0 / 0.1)",
    surface: "rgb(255 255 255 / 0.7)",
    "surface-hover": "#ffffff",
  },
};

/**
 * Accent presets (names are translated under Theme.accents). `dark` is used on the black theme and `light` (a deeper
 * shade) on the light theme, so accent text keeps at least 4.5:1 contrast
 * against the page in both. `trail` colors the neon cursor, head to tail.
 */
export const ACCENTS = [
  { id: "blue", dark: "#3b82f6", light: "#1d4ed8", trail: ["#22d3ee", "#3b82f6", "#8b5cf6"] },
  { id: "purple", dark: "#a855f7", light: "#7e22ce", trail: ["#e879f9", "#a855f7", "#6366f1"] },
  { id: "emerald", dark: "#10b981", light: "#047857", trail: ["#a3e635", "#10b981", "#06b6d4"] },
  { id: "cyan", dark: "#06b6d4", light: "#0e7490", trail: ["#67e8f9", "#06b6d4", "#3b82f6"] },
  { id: "rose", dark: "#f43f5e", light: "#be123c", trail: ["#fb923c", "#f43f5e", "#d946ef"] },
  { id: "amber", dark: "#f59e0b", light: "#b45309", trail: ["#fde047", "#f59e0b", "#ef4444"] },
] as const;

export type Accent = (typeof ACCENTS)[number];
export type AccentId = Accent["id"];

export const DEFAULT_MODE: Mode = "dark";
export const DEFAULT_ACCENT: AccentId = "purple";

export const STORAGE_KEYS = { mode: "theme-mode", accent: "theme-accent" } as const;

export const isModePreference = (value: unknown): value is ModePreference =>
  MODES.some((mode) => mode.id === value);

export const isAccentId = (value: unknown): value is AccentId =>
  ACCENTS.some((accent) => accent.id === value);

export const accentById = (id: AccentId): Accent =>
  ACCENTS.find((accent) => accent.id === id) ?? ACCENTS[0];

const declarations = (vars: Record<string, string>) =>
  Object.entries(vars)
    .map(([name, value]) => `--${name}:${value}`)
    .join(";");

/**
 * The CSS variables behind the Tailwind colors (bg-background, text-accent, …).
 * `data-theme` can also be set on a single element to pin it to one mode, as
 * the hero does.
 */
export function themeCss() {
  const accentDefault = accentById(DEFAULT_ACCENT);
  return [
    `:root,[data-theme=dark]{color-scheme:dark;${declarations(PALETTES.dark)};--accent:var(--accent-dark)}`,
    `[data-theme=light]{color-scheme:light;${declarations(PALETTES.light)};--accent:var(--accent-light)}`,
    `:root{--accent-dark:${accentDefault.dark};--accent-light:${accentDefault.light}}`,
    ...ACCENTS.map(
      (accent) =>
        `[data-accent=${accent.id}]{--accent-dark:${accent.dark};--accent-light:${accent.light}}`,
    ),
  ].join("\n");
}

/**
 * Runs in <head> before the page paints: applies the saved mode and accent,
 * or the device's color scheme when no mode was chosen, so the page never
 * flashes the wrong theme.
 */
export const themeInitScript = `(function(){try{
var d=document.documentElement,s=localStorage,
m=s.getItem(${JSON.stringify(STORAGE_KEYS.mode)}),a=s.getItem(${JSON.stringify(STORAGE_KEYS.accent)});
if(${JSON.stringify(MODES.map((mode) => mode.id))}.indexOf(m)<0)m="system";
if(m==="system")m=matchMedia("(prefers-color-scheme: light)").matches?"light":${JSON.stringify(DEFAULT_MODE)};
d.setAttribute("data-theme",m);
if(${JSON.stringify(ACCENTS.map((accent) => accent.id))}.indexOf(a)>=0)d.setAttribute("data-accent",a);
}catch(e){}})()`;
