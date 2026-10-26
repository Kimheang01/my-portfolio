import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Job, Profile, SkillGroup } from "@/modules/portfolio/types";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import SkillIcon from "./SkillIcon";

export default function About({
  profile,
  skillGroups,
  education,
}: {
  profile: Profile;
  skillGroups: SkillGroup[];
  /** Shown as "Studied" in the profile card */
  education?: Job;
}) {
  const t = useTranslations("About");
  const [lead, ...rest] = profile.aboutParagraphs;
  const facts = [
    { label: t("facts.basedIn"), value: profile.location },
    education && {
      label: t("facts.studied"),
      value: t("studiedValue", { subject: education.title, school: education.organization }),
    },
    { label: t("facts.languages"), value: profile.spokenLanguages.join(" · ") },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-20 sm:py-28 lg:py-32">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:gap-16">
        {/* Profile card: stays in view beside the bio and skills */}
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-3 sm:grid sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:items-center sm:gap-4 lg:block">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-accent/25 blur-3xl"
            />
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              {profile.photo && (
                <Image
                  src={profile.photo}
                  alt={t("photoAlt", { name: profile.name })}
                  fill
                  sizes="(min-width: 1024px) 380px, (min-width: 640px) 240px, 100vw"
                  className="object-cover"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/90 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-xl font-semibold">{profile.name}</p>
                <p className="text-sm text-accent">{profile.role}</p>
              </div>
            </div>
            <dl className="relative space-y-3 px-3 pt-5 pb-3 text-sm sm:pt-3 lg:pt-5">
              {facts.map((fact) => (
                <div key={fact.label} className="flex gap-4">
                  <dt className="w-20 shrink-0 text-muted min-[400px]:w-24">{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        {/* Bio and skills */}
        <div>
          <Reveal delay={0.05}>
            <p className="text-lead leading-relaxed">{lead}</p>
            <div className="mt-5 space-y-4 text-body text-muted sm:mt-6 sm:space-y-5">
              {rest.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h3 className="mt-12 font-mono text-xs tracking-widest text-muted uppercase">
              {t("skillsTitle")}
            </h3>
          </Reveal>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {skillGroups.map((group, i) => {
              const items = group.skills;
              return (
              <Reveal
                key={group.key}
                delay={0.1 + i * 0.05}
                className={items.length > 4 ? "sm:col-span-2" : ""}
              >
                <div className="group h-full rounded-2xl border border-line bg-surface p-4 transition min-[400px]:p-5 duration-300 hover:border-accent/40 hover:bg-surface-hover">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent transition group-hover:bg-accent/20">
                      <SkillIcon icon={group.icon} />
                    </span>
                    <p className="font-medium">{group.name}</p>
                  </div>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {items.map((item) => (
                      <li
                        key={item}
                        className="rounded-full border border-line px-3 py-1 text-[13px] text-muted transition group-hover:text-foreground min-[400px]:text-sm"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
