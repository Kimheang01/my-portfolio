import { site } from "@/content/site";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const isCurrent = (period: string) => /present|now/i.test(period);

export default function Experience() {
  const current = site.experience.find((job) => isCurrent(job.period));

  return (
    <section id="experience" className="mx-auto max-w-6xl px-6 py-20 sm:py-28 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)] lg:gap-16">
        {/* Left: stays in view while the timeline scrolls past */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading eyebrow="Experience" title="Where I've been" className="mb-6" />
          <Reveal delay={0.05}>
            <p className="max-w-sm text-body text-muted">{site.experienceIntro}</p>
          </Reveal>
          {current && (
            <Reveal delay={0.1}>
              <div className="mt-6 inline-flex items-center gap-3 rounded-2xl sm:mt-8 border border-line bg-white/[0.02] px-4 py-3">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                <span className="text-sm">
                  <span className="text-muted">Currently </span>
                  {current.title}
                  <span className="text-muted"> at </span>
                  {current.company}
                </span>
              </div>
            </Reveal>
          )}
        </div>

        {/* Right: timeline of cards */}
        <ol className="relative space-y-6 before:absolute before:top-3 before:bottom-3 before:left-[7px] before:w-px before:bg-gradient-to-b before:from-accent/60 before:via-line before:to-transparent">
          {site.experience.map((job, i) => {
            const now = isCurrent(job.period);
            return (
              <li key={`${job.company}-${job.title}`} className="relative pl-7 sm:pl-10">
                <span
                  className={`absolute top-7 left-0 h-[15px] w-[15px] sm:top-8 rounded-full border-2 ${
                    now
                      ? "border-accent bg-accent shadow-[0_0_0_6px_rgb(139_124_255/0.15)]"
                      : "border-accent/60 bg-background"
                  }`}
                />
                <Reveal delay={i * 0.06}>
                  <article className="group rounded-2xl border border-line bg-white/[0.02] p-5 transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-white/[0.04] min-[400px]:p-6 sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                      <div>
                        <p className="font-mono text-xs tracking-widest text-accent uppercase">
                          {job.kind === "education" ? "Education" : job.company}
                        </p>
                        <h3 className="mt-2 text-h3 font-semibold">{job.title}</h3>
                        {job.kind === "education" && (
                          <p className="mt-1 text-muted">{job.company}</p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-3 py-1 font-mono text-xs ${
                          now ? "border-accent/40 bg-accent/10 text-foreground" : "border-line text-muted"
                        }`}
                      >
                        {job.period}
                      </span>
                    </div>

                    {job.description && (
                      <p className="mt-4 text-body text-muted">{job.description}</p>
                    )}
                    {job.highlights && (
                      <ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
                        {job.highlights.map((item) => (
                          <li key={item} className="flex gap-3 text-body text-muted">
                            <span className="mt-[0.7em] h-px w-3 shrink-0 bg-accent" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {job.tags && (
                      <ul className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
                        {job.tags.map((tag) => (
                          <li
                            key={tag}
                            className="rounded-full bg-white/5 px-2.5 py-1 font-mono text-xs text-muted transition group-hover:text-foreground"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
