import { site } from "@/content/site";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-6xl px-6 py-32">
      <SectionHeading eyebrow="Experience" title="Where I've been" />

      <ol className="border-l border-line">
        {site.experience.map((job, i) => (
          <li key={`${job.company}-${job.title}`} className="relative pb-12 pl-8 last:pb-0">
            <span className="absolute top-2 -left-[5px] h-2.5 w-2.5 rounded-full bg-accent" />
            <Reveal delay={i * 0.05}>
              <p className="font-mono text-xs tracking-widest text-muted uppercase">
                {job.period}
              </p>
              <h3 className="mt-2 text-xl font-semibold">
                {job.title}{" "}
                <span className="font-normal text-muted">· {job.company}</span>
              </h3>
              {job.description && (
                <p className="mt-3 max-w-2xl leading-relaxed text-muted">
                  {job.description}
                </p>
              )}
              {job.highlights && (
                <ul className="mt-3 max-w-2xl list-disc space-y-2 pl-5 leading-relaxed text-muted marker:text-accent">
                  {job.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {job.tags && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full bg-white/5 px-2.5 py-1 font-mono text-xs text-muted"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
