import Image from "next/image";
import { site } from "@/content/site";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

// Outline icons (24×24) for each skill group, matched by group name.
const groupIcons: Record<string, React.ReactNode> = {
  "Front-end": (
    <>
      <path d="m16 18 6-6-6-6" />
      <path d="m8 6-6 6 6 6" />
    </>
  ),
  "Back-end": (
    <>
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <path d="M6 6h.01M6 18h.01" />
    </>
  ),
  Mobile: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 18h.01" />
    </>
  ),
  Databases: (
    <>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14a9 3 0 0 0 18 0V5" />
      <path d="M3 12a9 3 0 0 0 18 0" />
    </>
  ),
  Tools: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
};

function GroupIcon({ group }: { group: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      {groupIcons[group] ?? groupIcons["Front-end"]}
    </svg>
  );
}

export default function About() {
  const [lead, ...rest] = site.about;
  const education = site.experience.find((item) => item.kind === "education");
  const facts = [
    { label: "Based in", value: site.location },
    education && { label: "Studied", value: `${education.title}, ${education.company}` },
    { label: "Languages", value: site.languages.join(" · ") },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-20 sm:py-28 lg:py-32">
      <SectionHeading eyebrow="About" title="A little about me" />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:gap-16">
        {/* Profile card: stays in view beside the bio and skills */}
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative overflow-hidden rounded-3xl border border-line bg-white/[0.02] p-3 sm:grid sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:items-center sm:gap-4 lg:block">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-accent/25 blur-3xl"
            />
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src={site.photo}
                alt={`Portrait of ${site.name}`}
                fill
                sizes="(min-width: 1024px) 380px, (min-width: 640px) 240px, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/90 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-xl font-semibold">{site.name}</p>
                <p className="text-sm text-accent">{site.role}</p>
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
              Skills &amp; tools
            </h3>
          </Reveal>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {site.skills.map((skill, i) => (
              <Reveal
                key={skill.group}
                delay={0.1 + i * 0.05}
                className={skill.items.length > 4 ? "sm:col-span-2" : ""}
              >
                <div className="group h-full rounded-2xl border border-line bg-white/[0.02] p-4 transition min-[400px]:p-5 duration-300 hover:border-accent/40 hover:bg-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent transition group-hover:bg-accent/20">
                      <GroupIcon group={skill.group} />
                    </span>
                    <p className="font-medium">{skill.group}</p>
                  </div>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {skill.items.map((item) => (
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
