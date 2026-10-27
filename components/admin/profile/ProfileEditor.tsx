"use client";

import { startTransition, useActionState, useState } from "react";
import { cardStyle, Field, inputStyle, LocaleTabs, MoveButtons, SaveBar, useFieldErrors } from "@/components/admin/form";
import MediaPicker, { useMediaLibrary } from "@/components/admin/media/MediaPicker";
import { routing, type Locale } from "@/i18n/routing";
import type { ActionState } from "@/modules/admin/validation";
import type { MediaItem } from "@/modules/media/schema";
import { missingLocales, type ProfileInput, type ProfileText } from "@/modules/profile/schema";

type Action = (previous: ActionState, input: ProfileInput) => Promise<ActionState>;

/** The profile: who you are, the hero text and the About section, per language. */
export default function ProfileEditor({
  profile,
  media,
  action,
}: {
  profile: ProfileInput;
  /** The media library, to choose the photo from */
  media: MediaItem[];
  action: Action;
}) {
  const [draft, setDraft] = useState(profile);
  const library = useMediaLibrary(media);
  const [locale, setLocale] = useState<Locale>(routing.defaultLocale);
  const [state, dispatch, pending] = useActionState(action, null);
  const { errors, markEdited, reset } = useFieldErrors(state);
  const text = draft.translations[locale];
  const at = (field: string) => `translations.${locale}.${field}`;

  const set = (changes: Partial<Pick<ProfileInput, "name" | "email" | "photoMediaId">>) => {
    Object.keys(changes).forEach(markEdited);
    setDraft((d) => ({ ...d, ...changes }));
  };
  const setText = <K extends keyof ProfileText>(field: K, value: ProfileText[K]) => {
    markEdited(at(field));
    setDraft((d) => ({ ...d, translations: { ...d.translations, [locale]: { ...d.translations[locale], [field]: value } } }));
  };
  const roles = text.heroRoles;
  const setRole = (index: number, part: "first" | "second", value: string) =>
    setText("heroRoles", roles.map((role, i) => (i === index ? { ...role, [part]: value } : role)));
  const moveRole = (index: number, by: -1 | 1) => {
    const next = [...roles];
    [next[index], next[index + by]] = [next[index + by], next[index]];
    setText("heroRoles", next);
  };

  const textField = (field: "role" | "location" | "heroIntroHeading", label: string, hint?: string) => (
    <Field label={label} hint={hint} error={errors[at(field)]}>
      {(props) => <input {...props} className={inputStyle} value={text[field]} onChange={(event) => setText(field, event.target.value)} />}
    </Field>
  );
  const areaField = (
    field: "heroIntroText" | "heroStatement" | "aboutParagraphs" | "spokenLanguages",
    label: string,
    rows: number,
    hint?: string,
  ) => (
    <Field label={label} hint={hint} error={errors[at(field)]}>
      {(props) => (
        <textarea
          {...props}
          rows={rows}
          className={`${inputStyle} resize-y`}
          value={text[field]}
          onChange={(event) => setText(field, event.target.value)}
        />
      )}
    </Field>
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        reset();
        startTransition(() => dispatch(draft));
      }}
      className="max-w-3xl space-y-8"
    >
      <fieldset className={`${cardStyle} grid gap-5 p-5`}>
        <legend className="sr-only">You</legend>
        <MediaPicker
          label="Photo"
          hint="Shown in the About section, cropped to 4:5 (portrait)."
          value={draft.photoMediaId}
          onChange={(id) => set({ photoMediaId: id })}
          library={library}
          error={errors.photoMediaId}
          aspect="aspect-[4/5]"
        />
        <Field label="Name" error={errors.name}>
          {(props) => <input {...props} className={inputStyle} value={draft.name} onChange={(event) => set({ name: event.target.value })} />}
        </Field>
        <Field label="Email" hint="Shown in the Contact section." error={errors.email}>
          {(props) => (
            <input {...props} type="email" className={inputStyle} value={draft.email} onChange={(event) => set({ email: event.target.value })} />
          )}
        </Field>
      </fieldset>

      <LocaleTabs locale={locale} onChange={setLocale} missing={missingLocales(draft.translations)}>
        <div className="grid gap-5 sm:grid-cols-2">
          {textField("role", "Role", "e.g. Full-Stack Developer")}
          {textField("location", "Location", "e.g. Phnom Penh, Cambodia")}
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium">Hero headline</p>
          <p className="mb-3 text-xs text-muted">Rotates every few seconds. Each has two lines; the first is in the accent color.</p>
          {errors[at("heroRoles")] && <p className="mb-2 text-xs text-rose-400">{errors[at("heroRoles")]}</p>}
          <ol className="space-y-2">
            {roles.map((role, i) => (
              <li key={i} className="flex flex-wrap items-start gap-2 sm:flex-nowrap">
                {(["first", "second"] as const).map((part) => (
                  <div key={part} className="min-w-0 flex-1 basis-32">
                    <input
                      aria-label={`Headline ${i + 1}, ${part === "first" ? "first" : "second"} line`}
                      className={inputStyle}
                      value={role[part]}
                      placeholder={part === "first" ? "Full-Stack" : "Developer"}
                      aria-invalid={Boolean(errors[at(`heroRoles.${i}.${part}`)])}
                      onChange={(event) => setRole(i, part, event.target.value)}
                    />
                  </div>
                ))}
                <div className="flex items-center gap-1 pt-1">
                  <MoveButtons label={`headline ${i + 1}`} first={i === 0} last={i === roles.length - 1} onMove={(by) => moveRole(i, by)} />
                  <button
                    type="button"
                    aria-label={`Remove headline ${i + 1}`}
                    onClick={() => setText("heroRoles", roles.filter((_, j) => j !== i))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:text-rose-400"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ol>
          {roles.some((_, i) => errors[at(`heroRoles.${i}.first`)] || errors[at(`heroRoles.${i}.second`)]) && (
            <p className="mt-2 text-xs text-rose-400">Fill in both lines of every headline.</p>
          )}
          <button
            type="button"
            onClick={() => setText("heroRoles", [...roles, { first: "", second: "" }])}
            className="mt-3 inline-flex min-h-10 items-center rounded-full border border-dashed border-line px-4 text-sm text-muted transition hover:border-foreground hover:text-foreground"
          >
            + Add headline
          </button>
        </div>

        {textField("heroIntroHeading", "Intro heading", "The large line beside the headline.")}
        {areaField("heroIntroText", "Intro text", 3)}
        {areaField("heroStatement", "Hello statement", 3, "Revealed word by word while scrolling the hero.")}
        {areaField("aboutParagraphs", "About", 8, "Leave a blank line between paragraphs. The first one is shown larger.")}
        {areaField("spokenLanguages", "Spoken languages", 3, "One per line, e.g. Khmer (Native)")}
      </LocaleTabs>

      <SaveBar state={state} pending={pending} />
    </form>
  );
}
