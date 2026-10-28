"use client";

// Pieces every admin editor uses, so the forms look and behave alike.
import { useId, useRef, useState } from "react";
import { localeLabels, routing, type Locale } from "@/i18n/routing";
import type { ActionState, ContentStatus } from "@/modules/admin/validation";

export const inputStyle =
  "w-full rounded-xl border border-line bg-background px-3 py-2.5 text-sm transition outline-none focus:border-accent aria-[invalid=true]:border-rose-400";

export const cardStyle = "rounded-2xl border border-line bg-surface";

type FieldProps = { id: string; "aria-invalid": boolean; "aria-describedby"?: string };

/** A labelled input with an optional hint and error below it. */
export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: (props: FieldProps) => React.ReactNode;
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
 * The errors from the last save, minus those of fields edited since, so a
 * fixed field stops showing its old error. Call reset() when saving again.
 */
export function useFieldErrors(state: ActionState) {
  const [edited, setEdited] = useState<Set<string>>(() => new Set());
  const all = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  const errors: Record<string, string> = Object.fromEntries(
    Object.entries(all).filter(([key]) => ![...edited].some((e) => key === e || key.startsWith(`${e}.`))),
  );
  const markEdited = (key: string) =>
    setEdited((current) => (current.has(key) ? current : new Set(current).add(key)));
  const reset = () => setEdited(new Set());
  return { errors, markEdited, reset };
}

/** A tab per language, with a mark on those still missing text. */
export function LocaleTabs({
  locale,
  onChange,
  missing,
  children,
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
  missing: Locale[];
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className={cardStyle}>
      <div role="tablist" aria-label="Language" className="flex flex-wrap gap-1 border-b border-line p-2">
        {routing.locales.map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            id={`${id}-${l}`}
            aria-selected={locale === l}
            aria-controls={`${id}-panel`}
            onClick={() => onChange(l)}
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
      {/* lang: Khmer text gets the Khmer font and line heights while typing */}
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${locale}`} lang={locale} className="space-y-5 p-5">
        {children}
      </div>
    </div>
  );
}

const buttonStyle = (primary?: boolean) =>
  `inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium transition disabled:cursor-wait disabled:opacity-60 ${
    primary ? "bg-foreground text-background hover:bg-accent" : "border border-line hover:border-foreground"
  }`;

/** The result of the last save, read out to screen readers. */
function SaveMessage({ state, pending }: { state: ActionState; pending: boolean }) {
  return (
    <p role="status" className={`basis-full text-sm ${state?.ok ? "text-emerald-400" : "text-rose-400"}`}>
      {pending ? <span className="text-muted">Saving…</span> : state?.message}
    </p>
  );
}

/** A form's save buttons, for content with no draft or published state. */
export function SaveBar({
  state,
  pending,
  label = "Save",
  children,
}: {
  state: ActionState;
  pending: boolean;
  label?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="submit" disabled={pending} className={buttonStyle(true)}>
        {label}
      </button>
      {children}
      <SaveMessage state={state} pending={pending} />
    </div>
  );
}

/**
 * Save buttons for content that can be a draft, published or archived. Each
 * button saves the form with the status it names.
 */
export function StatusButtons({
  saved,
  state,
  pending,
  onSave,
}: {
  /** The status as saved, which decides which buttons are shown */
  saved: ContentStatus | "new";
  state: ActionState;
  pending: boolean;
  onSave: (status: ContentStatus) => void;
}) {
  const buttons: { label: string; status: ContentStatus; primary?: boolean }[] =
    saved === "published"
      ? [
          { label: "Save changes", status: "published", primary: true },
          { label: "Unpublish", status: "draft" },
        ]
      : saved === "archived"
        ? [
            { label: "Save", status: "archived", primary: true },
            { label: "Restore as draft", status: "draft" },
          ]
        : [
            { label: "Publish", status: "published", primary: true },
            { label: "Save draft", status: "draft" },
          ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {buttons.map((button) => (
        <button
          key={button.label}
          type="button"
          disabled={pending}
          onClick={() => onSave(button.status)}
          className={buttonStyle(button.primary)}
        >
          {button.label}
        </button>
      ))}
      {saved !== "archived" && saved !== "new" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => onSave("archived")}
          className="ml-auto inline-flex min-h-11 items-center rounded-full px-4 text-sm text-muted transition hover:text-rose-400 disabled:opacity-60"
        >
          Archive
        </button>
      )}
      <SaveMessage state={state} pending={pending} />
    </div>
  );
}

/** A button that asks first, in a native dialog, before doing something final. */
export function ConfirmButton({
  label,
  question,
  confirmLabel,
  disabled,
  onConfirm,
}: {
  label: string;
  question: string;
  confirmLabel: string;
  disabled?: boolean;
  onConfirm: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => dialog.current?.showModal()}
        className="inline-flex min-h-11 items-center rounded-full px-4 text-sm text-muted transition hover:text-rose-400 disabled:opacity-60"
      >
        {label}
      </button>
      <dialog
        ref={dialog}
        className="m-auto w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-line bg-background p-6 text-foreground backdrop:bg-black/60"
      >
        <p className="font-medium">{question}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => dialog.current?.close()} className={buttonStyle()}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              dialog.current?.close();
              onConfirm();
            }}
            className="inline-flex min-h-11 items-center rounded-full bg-rose-500 px-5 text-sm font-medium text-white transition hover:bg-rose-600"
          >
            {confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}

/** ↑ and ↓ buttons for moving an item in a list. */
export function MoveButtons({
  label,
  first,
  last,
  onMove,
}: {
  label: string;
  first: boolean;
  last: boolean;
  onMove: (direction: -1 | 1) => void;
}) {
  const style =
    "flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition hover:border-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-30";
  return (
    <div className="flex gap-1">
      <button type="button" disabled={first} onClick={() => onMove(-1)} aria-label={`Move ${label} up`} className={style}>
        ↑
      </button>
      <button type="button" disabled={last} onClick={() => onMove(1)} aria-label={`Move ${label} down`} className={style}>
        ↓
      </button>
    </div>
  );
}
