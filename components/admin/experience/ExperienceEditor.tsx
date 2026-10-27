"use client";

import { startTransition, useActionState, useState } from "react";
import { cardStyle, Field, inputStyle, LocaleTabs, StatusButtons, useFieldErrors } from "@/components/admin/form";
import { routing, type Locale } from "@/i18n/routing";
import { toSlug } from "@/lib/slug";
import type { ActionState, ContentStatus } from "@/modules/admin/validation";
import { missingLocales, type ExperienceInput, type ExperienceText } from "@/modules/experience/schema";

export type EditorExperience = Omit<ExperienceInput, "status" | "translations"> & {
  /** The saved status, which decides which buttons are shown */
  status: ContentStatus | "new";
  translations: Record<Locale, ExperienceText>;
};

type Action = (previous: ActionState, input: ExperienceInput) => Promise<ActionState>;

/** The form for a job or an education entry, with its text per language. */
export default function ExperienceEditor({ entry, action }: { entry: EditorExperience; action: Action }) {
  const { status: savedStatus, ...initial } = entry;
  const [draft, setDraft] = useState(initial);
  const [locale, setLocale] = useState<Locale>(routing.defaultLocale);
  // New entries take their slug from the organization until it's edited.
  const [slugEdited, setSlugEdited] = useState(savedStatus !== "new");
  const [state, dispatch, pending] = useActionState(action, null);
  const { errors, markEdited, reset } = useFieldErrors(state);
  const current = draft.end === "";

  const set = (changes: Partial<typeof draft>) => {
    Object.keys(changes).forEach(markEdited);
    setDraft((d) => ({ ...d, ...changes }));
  };
  const setText = (field: keyof ExperienceText, value: string) => {
    markEdited(`translations.${locale}.${field}`);
    setDraft((d) => ({ ...d, translations: { ...d.translations, [locale]: { ...d.translations[locale], [field]: value } } }));
  };
  const submit = (status: ContentStatus) => {
    reset();
    startTransition(() => dispatch({ ...draft, status }));
  };
  const text = draft.translations[locale];
  const education = draft.kind === "education";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit(savedStatus === "new" ? "draft" : savedStatus);
      }}
      className="max-w-3xl space-y-8"
    >
      <fieldset className={`${cardStyle} grid gap-5 p-5 sm:grid-cols-2`}>
        <legend className="sr-only">Details</legend>
        <div className="sm:col-span-2">
          <p className="mb-1.5 text-sm font-medium">Kind</p>
          <div className="flex gap-2">
            {(["work", "education"] as const).map((kind) => (
              <label
                key={kind}
                className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-line px-4 text-sm has-checked:border-accent has-checked:bg-accent/10"
              >
                <input
                  type="radio"
                  name="kind"
                  value={kind}
                  checked={draft.kind === kind}
                  onChange={() => set({ kind })}
                  className="accent-[var(--accent)]"
                />
                {kind === "work" ? "Job" : "Education"}
              </label>
            ))}
          </div>
        </div>
        <Field label={education ? "School" : "Company"} error={errors.organization}>
          {(props) => (
            <input
              {...props}
              className={inputStyle}
              value={draft.organization}
              onChange={(event) => {
                set({ organization: event.target.value });
                if (!slugEdited) set({ slug: toSlug(event.target.value) });
              }}
            />
          )}
        </Field>
        <Field label="Slug" hint="Its id; lowercase words joined by hyphens." error={errors.slug}>
          {(props) => (
            <input
              {...props}
              className={`${inputStyle} font-mono`}
              value={draft.slug}
              autoCapitalize="none"
              spellCheck={false}
              onChange={(event) => {
                setSlugEdited(true);
                set({ slug: event.target.value });
              }}
            />
          )}
        </Field>
        <Field label="Start" error={errors.start}>
          {(props) => (
            <input {...props} type="month" className={inputStyle} value={draft.start} onChange={(event) => set({ start: event.target.value })} />
          )}
        </Field>
        <div>
          <Field label="End" error={errors.end}>
            {(props) => (
              <input
                {...props}
                type="month"
                className={`${inputStyle} disabled:opacity-40`}
                value={draft.end}
                disabled={current}
                onChange={(event) => set({ end: event.target.value })}
              />
            )}
          </Field>
          <label className="mt-2 flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={current}
              // Unticking starts the end at the start month, to be changed.
              onChange={(event) => set({ end: event.target.checked ? "" : draft.start })}
              className="accent-[var(--accent)]"
            />
            {education ? "Still studying here" : "I work here now"}
          </label>
        </div>
        <div className="sm:col-span-2">
          <Field label="Tags" hint="Optional, separated by commas, e.g. React Native, Expo" error={errors.tags}>
            {(props) => <input {...props} className={inputStyle} value={draft.tags} onChange={(event) => set({ tags: event.target.value })} />}
          </Field>
        </div>
      </fieldset>

      <LocaleTabs locale={locale} onChange={setLocale} missing={missingLocales(draft.translations)}>
        <Field label={education ? "Program" : "Job title"} hint={education ? "e.g. Computer Science" : "e.g. Mobile Developer"} error={errors[`translations.${locale}.title`]}>
          {(props) => <input {...props} className={inputStyle} value={text.title} onChange={(event) => setText("title", event.target.value)} />}
        </Field>
        <Field label="Highlights" hint="One per line. Shown as a list." error={errors[`translations.${locale}.highlights`]}>
          {(props) => (
            <textarea
              {...props}
              rows={5}
              className={`${inputStyle} resize-y`}
              value={text.highlights}
              onChange={(event) => setText("highlights", event.target.value)}
            />
          )}
        </Field>
        <Field label="Description" hint="Optional. Shown above the highlights; education entries usually use this instead." error={errors[`translations.${locale}.description`]}>
          {(props) => (
            <textarea
              {...props}
              rows={3}
              className={`${inputStyle} resize-y`}
              value={text.description}
              onChange={(event) => setText("description", event.target.value)}
            />
          )}
        </Field>
      </LocaleTabs>

      <StatusButtons saved={savedStatus} state={state} pending={pending} onSave={submit} />
    </form>
  );
}
