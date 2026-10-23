"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_ACCENT,
  DEFAULT_MODE,
  PALETTES,
  STORAGE_KEYS,
  isAccentId,
  isModePreference,
  type AccentId,
  type Mode,
  type ModePreference,
} from "./theme";

export type ThemeState = {
  /** What the visitor picked. */
  mode: ModePreference;
  /** The mode actually shown (`system` resolved against the device). */
  resolved: Mode;
  accent: AccentId;
};

// Before hydration the server can't know the visitor's choice, so components
// render these defaults first and update right after, with no mismatch.
const SERVER_STATE: ThemeState = { mode: "system", resolved: DEFAULT_MODE, accent: DEFAULT_ACCENT };

let state: ThemeState | null = null;
const listeners = new Set<() => void>();

const prefersLight = () => window.matchMedia("(prefers-color-scheme: light)");
const resolve = (mode: ModePreference): Mode =>
  mode === "system" ? (prefersLight().matches ? "light" : DEFAULT_MODE) : mode;

// localStorage can be missing or throw (private mode, blocked site data).
function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function load(): ThemeState {
  const saved = read(STORAGE_KEYS.mode);
  const accent = read(STORAGE_KEYS.accent);
  const mode = isModePreference(saved) ? saved : "system";
  return { mode, resolved: resolve(mode), accent: isAccentId(accent) ? accent : DEFAULT_ACCENT };
}

export function getTheme(): ThemeState {
  return (state ??= load());
}

/** Writes the theme onto <html>, where the CSS variables pick it up. */
export function applyTheme({ resolved, accent }: ThemeState = getTheme()) {
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.dataset.accent = accent;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", PALETTES[resolved].background);
}

function update(next: ThemeState, animate: boolean) {
  const previous = getTheme();
  state = next;
  listeners.forEach((listener) => listener());
  if (previous.resolved === next.resolved && previous.accent === next.accent) return;

  // Cross-fade the whole page where the browser supports view transitions.
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (animate && !reduced && document.startViewTransition) {
    document.startViewTransition(() => applyTheme(next));
  } else {
    applyTheme(next);
  }
}

export function setMode(mode: ModePreference) {
  write(STORAGE_KEYS.mode, mode);
  update({ ...getTheme(), mode, resolved: resolve(mode) }, true);
}

export function setAccent(accent: AccentId) {
  write(STORAGE_KEYS.accent, accent);
  update({ ...getTheme(), accent }, true);
}

// Follow the device setting while in "system" mode, and keep other open tabs
// in sync. Listening starts with the first subscriber.
const onSystemChange = () => {
  const current = getTheme();
  if (current.mode === "system") update({ ...current, resolved: resolve("system") }, true);
};
const onStorage = (event: StorageEvent) => {
  if (event.key === STORAGE_KEYS.mode || event.key === STORAGE_KEYS.accent) update(load(), false);
};

export function subscribeTheme(listener: () => void) {
  if (listeners.size === 0) {
    prefersLight().addEventListener("change", onSystemChange);
    window.addEventListener("storage", onStorage);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      prefersLight().removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function useTheme() {
  return useSyncExternalStore(subscribeTheme, getTheme, () => SERVER_STATE);
}
