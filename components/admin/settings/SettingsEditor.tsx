"use client";

import { startTransition, useActionState, useState } from "react";
import { cardStyle, Field, inputStyle, LocaleTabs, MoveButtons, SaveBar, useFieldErrors } from "@/components/admin/form";
import SocialIcon from "@/components/SocialIcon";
import { routing, type Locale } from "@/i18n/routing";
import type { ActionState } from "@/modules/admin/validation";
import { missingLocales, type SettingsInput } from "@/modules/settings/schema";

type Action = (previous: ActionState, input: SettingsInput) => Promise<ActionState>;

const limits = { title: 70, description: 200 };

/** Social links (order, link, handle, shown or hidden) and the SEO text. */
export default function SettingsEditor({ settings, action }: { settings: SettingsInput; action: Action }) {
  const [socials, setSocials] = useState(settings.socials);
  const [seo, setSeo] = useState(settings.seo);
  const [locale, setLocale] = useState<Locale>(routing.defaultLocale);
  const [state, dispatch, pending] = useActionState(action, null);
  const { errors, markEdited, reset } = useFieldErrors(state);

  const setSocial = (index: number, changes: Partial<SettingsInput["socials"][number]>) => {
    Object.keys(changes).forEach((key) => markEdited(`socials.${index}.${key}`));
    setSocials((list) => list.map((s, i) => (i === index ? { ...s, ...changes } : s)));
  };
  const move = (index: number, by: -1 | 1) => {
    // Errors are keyed by position, so they're stale once rows move.
    reset();
    setSocials((list) => {
      const next = [...list];
      [next[index], next[index + by]] = [next[index + by], next[index]];
      return next;
    });
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        reset();
        startTransition(() => dispatch({ socials, seo }));
      }}
      className="max-w-3xl space-y-8"
    >
      <section aria-labelledby="socials-heading" className={`${cardStyle} p-5`}>
        <h2 id="socials-heading" className="font-medium">Social links</h2>
        <p className="mt-1 mb-5 text-xs text-muted">
          Shown in the footer and the Contact section, in this order. Leave a link empty to remove it.
        </p>
        <ol className="space-y-4">
          {socials.map((social, i) => (
            <li key={social.platform} className="grid gap-3 border-t border-line pt-4 first:border-0 first:pt-0 sm:grid-cols-[8rem_minmax(0,1fr)_minmax(0,0.7fr)]">
              <div className="flex items-center gap-2 sm:pt-7">
                <SocialIcon platform={social.platform} />
                <span className="text-sm font-medium">{social.platform}</span>
              </div>
              <Field label="Link" error={errors[`socials.${i}.href`]}>
                {(props) => (
                  <input
                    {...props}
                    type="url"
                    inputMode="url"
                    className={inputStyle}
                    value={social.href}
                    placeholder="https://"
                    onChange={(event) => setSocial(i, { href: event.target.value })}
                  />
                )}
              </Field>
              <Field label="Shown as" error={errors[`socials.${i}.handle`]}>
                {(props) => (
                  <input
                    {...props}
                    className={inputStyle}
                    value={social.handle}
                    placeholder={social.platform}
                    onChange={(event) => setSocial(i, { handle: event.target.value })}
                  />
                )}
              </Field>
              <div className="flex items-center justify-between gap-3 sm:col-start-2 sm:col-end-4">
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input
                    type="checkbox"
                    checked={social.visible}
                    onChange={(event) => setSocial(i, { visible: event.target.checked })}
                    className="accent-[var(--accent)]"
                  />
                  Show on the site
                </label>
                <MoveButtons label={social.platform} first={i === 0} last={i === socials.length - 1} onMove={(by) => move(i, by)} />
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="seo-heading" className="space-y-3">
        <div>
          <h2 id="seo-heading" className="font-medium">Search and sharing</h2>
          <p className="mt-1 text-xs text-muted">The page title in the browser tab, and the text search engines and shared links show.</p>
        </div>
        <LocaleTabs locale={locale} onChange={setLocale} missing={missingLocales(seo)}>
          {(["title", "description"] as const).map((field) => (
            <Field
              key={`${locale}-${field}`}
              label={field === "title" ? "Title" : "Description"}
              hint={`${seo[locale][field].length} / ${limits[field]} characters`}
              error={errors[`seo.${locale}.${field}`]}
            >
              {(props) =>
                field === "title" ? (
                  <input
                    {...props}
                    className={inputStyle}
                    value={seo[locale].title}
                    onChange={(event) => {
                      markEdited(`seo.${locale}.title`);
                      setSeo((s) => ({ ...s, [locale]: { ...s[locale], title: event.target.value } }));
                    }}
                  />
                ) : (
                  <textarea
                    {...props}
                    rows={3}
                    className={`${inputStyle} resize-y`}
                    value={seo[locale].description}
                    onChange={(event) => {
                      markEdited(`seo.${locale}.description`);
                      setSeo((s) => ({ ...s, [locale]: { ...s[locale], description: event.target.value } }));
                    }}
                  />
                )
              }
            </Field>
          ))}
        </LocaleTabs>
      </section>

      <SaveBar state={state} pending={pending} />
    </form>
  );
}
