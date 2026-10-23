import Image from "next/image";
import { site } from "@/content/site";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-32">
      <SectionHeading eyebrow="About" title="A little about me" />

      <div className="grid gap-16 md:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
            <div className="relative aspect-[3/4] w-40 shrink-0 overflow-hidden rounded-2xl border border-line">
              <Image
                src={site.photo}
                alt={`Portrait of ${site.name}`}
                fill
                sizes="160px"
                className="object-cover"
              />
            </div>
            <div className="space-y-5 text-lg leading-relaxed text-muted">
              {site.about.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <dl className="grid grid-cols-3 gap-4 border-y border-line py-6">
            {site.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-3xl font-semibold">{stat.value}</dd>
                <dd className="mt-1 text-xs text-muted">{stat.label}</dd>
              </div>
            ))}
          </dl>

          <h3 className="mt-10 font-mono text-xs tracking-widest text-muted uppercase">
            Skills &amp; tools
          </h3>
          <div className="mt-4 space-y-4">
            {site.skills.map((skill) => (
              <div key={skill.group}>
                <p className="text-sm text-muted">{skill.group}</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {skill.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-line px-3 py-1.5 text-sm"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h3 className="mt-10 font-mono text-xs tracking-widest text-muted uppercase">
            Languages
          </h3>
          <p className="mt-3 text-sm">{site.languages.join(" · ")}</p>
        </Reveal>
      </div>
    </section>
  );
}
