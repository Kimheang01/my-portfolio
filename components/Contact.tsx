import { site } from "@/content/site";
import CopyEmailButton from "./CopyEmailButton";
import Reveal from "./Reveal";
import SocialIcon from "./SocialIcon";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function ChannelRow({
  href,
  icon,
  label,
  value,
  external = true,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  external?: boolean;
}) {
  return (
    <li>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className="group flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.04]"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-muted transition group-hover:border-accent/50 group-hover:text-foreground">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-muted">{label}</span>
          <span className="block truncate font-medium">{value}</span>
        </span>
        <span
          aria-hidden
          className="text-muted transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent"
        >
          ↗
        </span>
      </a>
    </li>
  );
}

export default function Contact() {
  const socials = site.socials.filter((social) => social.href);

  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-32">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-line bg-white/[0.02]">
          {/* Background glow */}
          <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -right-32 -bottom-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative grid gap-12 p-8 sm:p-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:p-16">
            <div>
              <p className="font-mono text-sm tracking-widest text-accent uppercase">
                Contact
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Let&apos;s build something together.
              </h2>
              <p className="mt-6 max-w-md leading-relaxed text-muted">
                Have a project in mind, a role to talk about, or just want to say
                hi? Send me an email or a message on any of these.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:bg-accent hover:text-foreground"
                >
                  <MailIcon />
                  Email me
                </a>
                <CopyEmailButton email={site.email} />
              </div>

              <p className="mt-8 flex items-center gap-2 text-sm text-muted">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Based in {site.location}
              </p>
            </div>

            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-background/50 backdrop-blur">
              <ChannelRow
                href={`mailto:${site.email}`}
                icon={<MailIcon />}
                label="Email"
                value={site.email}
                external={false}
              />
              {socials.map((social) => (
                <ChannelRow
                  key={social.label}
                  href={social.href}
                  icon={<SocialIcon label={social.label} />}
                  label={social.label}
                  value={social.handle ?? social.label}
                />
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
