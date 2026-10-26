"use client";

import { startTransition, useActionState, useId, useState } from "react";
import ProjectCard, { type ProjectCardLabels } from "@/components/ProjectCard";
import { localeLabels, routing, type Locale } from "@/i18n/routing";
import type { SaveState } from "@/modules/projects/actions";
import {
  missingLocales,
  TRANSLATED_FIELDS,
  type ProjectInput,
  type ProjectStatus,
  type TranslatedField,
} from "@/modules/projects/schema";

export type EditorProject = Omit<ProjectInput, "status"> & {
  /** The saved status, which decides which buttons are shown */
  status: ProjectStatus | "new";
  logo: string | null;
  image: string | null;
};

type Action = (previous: SaveState, input: ProjectInput) => Promise<SaveState>;

const fieldLabels: Record<TranslatedField, { label: string; hint?: string; rows?: number }> = {
  title: { label: "Title" },
  type: { label: "Type", hint: "e.g. iOS & Android app" },
  context: { label: "Context", hint: "Where and when, e.g. BS Express · 2026" },
  description: { label: "Description", rows: 4 },
};

const inputStyle =
  "w-full rounded-xl border border-line bg-background px-3 py-2.5 text-sm transition outline-none focus:border-accent aria-[invalid=true]:border-rose-400";

// "My App!" → "my-app"
const toSlug = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => React.ReactNode;
}) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * The project form: shared details, the text in each language (with a mark
 * on languages that are missing text), and a live preview of the public card.
 */
export default function ProjectEditor({
  project,
  action,
  cardLabels,
}: {
  project: EditorProject;
  action: Action;
  /** The card's interface text per language; "{title}" is filled in here */
  cardLabels: Record<Locale, ProjectCardLabels>;
}) {
  const { status: savedStatus, logo, image, ...initial } = project;
  const [draft, setDraft] = useState(initial);
  const [locale, setLocale] = useState<Locale>(routing.defaultLocale);
  // New projects take their slug from the English title until it's edited.
  const [slugEdited, setSlugEdited] = useState(savedStatus !== "new");
  const [state, dispatch, pending] = useActionState(action, null);
  // Fields changed since the last save attempt; their old errors are hidden.
  const [edited, setEdited] = useState<Set<string>>(() => new Set());
  const serverErrors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  const errors = Object.fromEntries(Object.entries(serverErrors).filter(([key]) => !edited.has(key)));
  const missing = missingLocales(draft.translations);
  const tabId = useId();

  const markEdited = (key: string) => setEdited((current) => (current.has(key) ? current : new Set(current).add(key)));
  const set = (changes: Partial<typeof draft>) => {
    Object.keys(changes).forEach(markEdited);
    setDraft((current) => ({ ...current, ...changes }));
  };
  const setText = (field: TranslatedField, value: string) => {
    markEdited(`translations.${locale}.${field}`);
    setDraft((current) => {
      const translations = { ...current.translations, [locale]: { ...current.translations[locale], [field]: value } };
      const slug =
        !slugEdited && field === "title" && locale === routing.defaultLocale ? toSlug(value) : current.slug;
      return { ...current, translations, slug };
    });
  };
  const submit = (status: ProjectStatus) => {
    setEdited(new Set());
    startTransition(() => dispatch({ ...draft, status }));
  };

  const text = draft.translations[locale];
  const labels = cardLabels[locale];
  const fill = (template: string) => template.replace("{title}", text.title);
  const preview = {
    slug: draft.slug,
    // A half-typed color would break the card's styles, so show grey instead.
    color: /^#[0-9a-fA-F]{6}$/.test(draft.color) ? draft.color : "#808080",
    monogram: draft.monogram.trim() || null,
    logo,
    image,
    href: draft.href.trim() || null,
    repo: draft.repo.trim() || null,
    tags: draft.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    ...text,
  };

  const buttons: { label: string; status: ProjectStatus; primary?: boolean }[] =
    savedStatus === "published"
      ? [
          { label: "Save changes", status: "published", primary: true },
          { label: "Unpublish", status: "draft" },
        ]
      : savedStatus === "archived"
        ? [
            { label: "Save", status: "archived", primary: true },
            { label: "Restore as draft", status: "draft" },
          ]
        : [
            { label: "Publish", status: "published", primary: true },
            { label: "Save draft", status: "draft" },
          ];

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit(savedStatus === "new" ? "draft" : savedStatus);
      }}
      className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]"
    >
      <div className="space-y-8">
        {/* Same in every language */}
        <fieldset className="grid gap-5 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-2">
          <legend className="sr-only">Details</legend>
          <Field label="Slug" hint="Its id in links; lowercase words joined by hyphens." error={errors.slug}>
            {(props) => (
              <input
                {...props}
                className={`${inputStyle} font-mono`}
                value={draft.slug}
                onChange={(event) => {
                  setSlugEdited(true);
                  set({ slug: event.target.value });
                }}
                autoCapitalize="none"
                spellCheck={false}
              />
            )}
          </Field>
          <Field label="Brand color" hint="The card's glow, as #rrggbb." error={errors.color}>
            {(props) => (
              <div className="flex gap-2">
                <input
                  type="color"
                  aria-label="Pick a color"
                  value={preview.color}
                  onChange={(event) => set({ color: event.target.value })}
                  className="h-[42px] w-12 shrink-0 cursor-pointer rounded-xl border border-line bg-background p-1"
                />
                <input
                  {...props}
                  className={`${inputStyle} font-mono`}
                  value={draft.color}
                  onChange={(event) => set({ color: event.target.value })}
                  spellCheck={false}
                />
              </div>
            )}
          </Field>
          <Field label="Tags" hint="Separated by commas, e.g. React Native, Expo" error={errors.tags}>
            {(props) => (
              <input {...props} className={inputStyle} value={draft.tags} onChange={(event) => set({ tags: event.target.value })} />
            )}
          </Field>
          <Field
            label="Monogram"
            hint={logo ? "Not shown: the project has a logo." : "Up to 3 letters shown instead of a logo."}
            error={errors.monogram}
          >
            {(props) => (
              <input
                {...props}
                className={inputStyle}
                value={draft.monogram}
                maxLength={3}
                onChange={(event) => set({ monogram: event.target.value })}
              />
            )}
          </Field>
          <Field label="Live site" hint="Optional, https:// only." error={errors.href}>
            {(props) => (
              <input {...props} type="url" inputMode="url" className={inputStyle} value={draft.href} placeholder="https://" onChange={(event) => set({ href: event.target.value })} />
            )}
          </Field>
          <Field label="Source code" hint="Optional, https:// only." error={errors.repo}>
            {(props) => (
              <input {...props} type="url" inputMode="url" className={inputStyle} value={draft.repo} placeholder="https://" onChange={(event) => set({ repo: event.target.value })} />
            )}
          </Field>
        </fieldset>

        {/* The text, one language at a time */}
        <div className="rounded-2xl border border-line bg-surface">
          <div role="tablist" aria-label="Language" className="flex gap-1 border-b border-line p-2">
            {routing.locales.map((l) => (
              <button
                key={l}
                type="button"
                role="tab"
                id={`${tabId}-${l}`}
                aria-selected={locale === l}
                aria-controls={`${tabId}-panel`}
                onClick={() => setLocale(l)}
                className="flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm text-muted transition hover:text-foreground aria-selected:bg-accent/10 aria-selected:text-foreground"
              >
                {localeLabels[l].name}
                {missing.includes(l) && (
                  <span className="flex items-center gap-1 text-xs text-amber-400">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    missing text
                  </span>
                )}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id={`${tabId}-panel`}
            aria-labelledby={`${tabId}-${locale}`}
            lang={locale}
            className="space-y-5 p-5"
          >
            {TRANSLATED_FIELDS.map((field) => {
              const { label, hint, rows } = fieldLabels[field];
              const error = errors[`translations.${locale}.${field}`];
              return (
                <Field key={`${locale}-${field}`} label={label} hint={hint} error={error}>
                  {(props) =>
                    rows ? (
                      <textarea
                        {...props}
                        rows={rows}
                        className={`${inputStyle} resize-y`}
                        value={text[field]}
                        onChange={(event) => setText(field, event.target.value)}
                      />
                    ) : (
                      <input {...props} className={inputStyle} value={text[field]} onChange={(event) => setText(field, event.target.value)} />
                    )
                  }
                </Field>
              );
            })}
          </div>
        </div>

        {/* Saving */}
        <div className="flex flex-wrap items-center gap-3">
          {buttons.map((button) => (
            <button
              key={button.label}
              type="button"
              disabled={pending}
              onClick={() => submit(button.status)}
              className={`inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium transition disabled:cursor-wait disabled:opacity-60 ${
                button.primary
                  ? "bg-foreground text-background hover:bg-accent"
                  : "border border-line hover:border-foreground"
              }`}
            >
              {button.label}
            </button>
          ))}
          {savedStatus !== "archived" && savedStatus !== "new" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => submit("archived")}
              className="ml-auto inline-flex min-h-11 items-center rounded-full px-4 text-sm text-muted transition hover:text-rose-400 disabled:opacity-60"
            >
              Archive
            </button>
          )}
          <p role="status" className={`basis-full text-sm ${state?.ok ? "text-emerald-400" : "text-rose-400"}`}>
            {pending ? <span className="text-muted">Saving…</span> : state?.message}
          </p>
        </div>
      </div>

      {/* Live preview of the public card */}
      <aside className="xl:sticky xl:top-6 xl:self-start">
        <p className="mb-3 text-sm text-muted">
          Preview · {localeLabels[locale].name}
        </p>
        <div lang={locale} className="pointer-events-none">
          <ProjectCard
            project={preview}
            labels={{
              liveSite: labels.liveSite,
              source: labels.source,
              logoAlt: fill(labels.logoAlt),
              screenshotAlt: fill(labels.screenshotAlt),
            }}
          />
        </div>
      </aside>
    </form>
  );
}
