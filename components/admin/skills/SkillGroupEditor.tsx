"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { cardStyle, ConfirmButton, inputStyle, MoveButtons, SaveBar, useFieldErrors } from "@/components/admin/form";
import SkillIcon from "@/components/SkillIcon";
import { localeLabels, routing, type Locale } from "@/i18n/routing";
import type { ActionState } from "@/modules/admin/validation";
import { SKILL_ICONS, type SkillGroupInput, type SkillIconId } from "@/modules/skills/schema";

type Names = Record<Locale, string>;
export type EditorSkillGroup = { icon: SkillIconId; names: Names; skills: { names: Names }[] };

type Action = (previous: ActionState, input: SkillGroupInput) => Promise<ActionState>;

const iconLabels: Record<SkillIconId, string> = {
  frontend: "Code",
  backend: "Server",
  mobile: "Phone",
  databases: "Database",
  tools: "Wrench",
};

const blankNames = () => Object.fromEntries(routing.locales.map((l) => [l, ""])) as Names;

/**
 * A skill group: its icon and name, and its skills as rows with a name per
 * language. A blank translation uses the English name.
 */
export default function SkillGroupEditor({
  group,
  action,
  remove,
}: {
  group: EditorSkillGroup;
  action: Action;
  /** Deletes the group; only for a group that's already saved */
  remove?: () => Promise<void>;
}) {
  // Each row gets a stable key so React keeps its inputs when rows move.
  const nextKey = useRef(group.skills.length);
  const [icon, setIcon] = useState(group.icon);
  const [names, setNames] = useState(group.names);
  const [rows, setRows] = useState(group.skills.map((skill, key) => ({ key, names: skill.names })));
  const [state, dispatch, pending] = useActionState(action, null);
  const { errors, markEdited, reset } = useFieldErrors(state);

  const setRow = (index: number, locale: Locale, value: string) => {
    markEdited(`skills.${index}.names.${locale}`);
    setRows((current) => current.map((row, i) => (i === index ? { ...row, names: { ...row.names, [locale]: value } } : row)));
  };
  const moveRow = (index: number, by: -1 | 1) =>
    setRows((current) => {
      const next = [...current];
      [next[index], next[index + by]] = [next[index + by], next[index]];
      return next;
    });
  const addRow = () => setRows((current) => [...current, { key: nextKey.current++, names: blankNames() }]);
  // Row errors are keyed by position, so they're stale once rows change.
  const changeRows = <T,>(change: (arg: T) => void) => (arg: T) => {
    reset();
    change(arg);
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        reset();
        startTransition(() => dispatch({ icon, names, skills: rows.map((row) => ({ names: row.names })) }));
      }}
      className="max-w-3xl space-y-8"
    >
      <fieldset className={`${cardStyle} space-y-5 p-5`}>
        <legend className="sr-only">Group</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          {routing.locales.map((locale) => (
            <div key={locale}>
              <label htmlFor={`group-${locale}`} className="mb-1.5 block text-sm font-medium">
                Name · {localeLabels[locale].name}
              </label>
              <input
                id={`group-${locale}`}
                lang={locale}
                className={inputStyle}
                value={names[locale]}
                placeholder={locale === routing.defaultLocale ? "e.g. Front-end" : names[routing.defaultLocale]}
                aria-invalid={Boolean(errors[`names.${locale}`])}
                onChange={(event) => {
                  markEdited(`names.${locale}`);
                  setNames((current) => ({ ...current, [locale]: event.target.value }));
                }}
              />
              {locale !== routing.defaultLocale && <p className="mt-1 text-xs text-muted">Leave empty to use the English name.</p>}
              {errors[`names.${locale}`] && <p className="mt-1 text-xs text-rose-400">{errors[`names.${locale}`]}</p>}
            </div>
          ))}
        </div>
        <div role="radiogroup" aria-label="Icon">
          <p className="mb-1.5 text-sm font-medium">Icon</p>
          <div className="flex flex-wrap gap-2">
            {SKILL_ICONS.map((id) => (
              <label
                key={id}
                className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-line px-3 text-sm text-muted has-checked:border-accent has-checked:bg-accent/10 has-checked:text-foreground"
              >
                <input type="radio" name="icon" value={id} checked={icon === id} onChange={() => setIcon(id)} className="sr-only" />
                <SkillIcon icon={id} />
                {iconLabels[id]}
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset className={`${cardStyle} p-5`}>
        <legend className="sr-only">Skills</legend>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium">Skills</p>
          <p className="text-xs text-muted">Shown in this order. Empty translations use the English name.</p>
        </div>
        {errors.skills && <p className="mb-3 text-xs text-rose-400">{errors.skills}</p>}
        {rows.length > 0 && (
          <div aria-hidden className="mb-2 hidden gap-2 text-xs text-muted sm:flex">
            {routing.locales.map((locale) => (
              <span key={locale} className="flex-1 basis-36">
                {localeLabels[locale].name}
              </span>
            ))}
            <span className="w-[6.75rem] shrink-0" />
          </div>
        )}
        <ol className="space-y-3">
          {rows.map((row, i) => {
            const label = row.names[routing.defaultLocale] || `skill ${i + 1}`;
            return (
              <li key={row.key} className="flex flex-wrap items-start gap-2 sm:flex-nowrap">
                {routing.locales.map((locale) => (
                  <div key={locale} className="min-w-0 flex-1 basis-36">
                    <input
                      aria-label={`Skill ${i + 1}, ${localeLabels[locale].name}`}
                      lang={locale}
                      className={inputStyle}
                      value={row.names[locale]}
                      placeholder={locale === routing.defaultLocale ? "e.g. React" : row.names[routing.defaultLocale]}
                      aria-invalid={Boolean(errors[`skills.${i}.names.${locale}`])}
                      onChange={(event) => setRow(i, locale, event.target.value)}
                    />
                    {errors[`skills.${i}.names.${locale}`] && (
                      <p className="mt-1 text-xs text-rose-400">{errors[`skills.${i}.names.${locale}`]}</p>
                    )}
                  </div>
                ))}
                <div className="flex items-center gap-1 pt-1">
                  <MoveButtons label={label} first={i === 0} last={i === rows.length - 1} onMove={changeRows((by: -1 | 1) => moveRow(i, by))} />
                  <button
                    type="button"
                    aria-label={`Remove ${label}`}
                    onClick={changeRows(() => setRows((current) => current.filter((_, j) => j !== i)))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:text-rose-400"
                  >
                    ✕
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
        <button
          type="button"
          onClick={addRow}
          className="mt-4 inline-flex min-h-10 items-center rounded-full border border-dashed border-line px-4 text-sm text-muted transition hover:border-foreground hover:text-foreground"
        >
          + Add skill
        </button>
      </fieldset>

      <SaveBar state={state} pending={pending}>
        {remove && (
          <ConfirmButton
            label="Delete group"
            question={`Delete “${group.names[routing.defaultLocale]}” and its ${group.skills.length} skills? This can't be undone.`}
            confirmLabel="Delete"
            disabled={pending}
            onConfirm={() => startTransition(() => remove())}
          />
        )}
      </SaveBar>
    </form>
  );
}
