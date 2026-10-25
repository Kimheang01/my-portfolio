import { useTranslations } from "next-intl";
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
        className="group flex items-center gap-3 px-4 py-4 transition hover:bg-foreground/[0.04] active:bg-foreground/[0.06] min-[400px]:gap-4 sm:px-5"
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
  const t = useTranslations("Contact");
  const tCommon = useTranslations("Common");
  const socials = site.socials.filter((social) => social.href);

  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-20 sm:py-28 lg:py-32">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-line bg-surface">
          {/* Background glow */}
          <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-accent/20 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -right-32 -bottom-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative grid gap-10 p-5 min-[400px]:p-7 sm:gap-12 sm:p-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:p-16">
            <div>
              <p className="font-mono text-sm tracking-widest text-accent uppercase">
                {t("eyebrow")}
              </p>
              <h2 className="mt-4 text-h2 font-semibold tracking-tight">{t("title")}</h2>
              <p className="mt-5 max-w-md text-body text-muted sm:mt-6">{t("text")}</p>

              <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:bg-accent active:bg-accent"
                >
                  <MailIcon />
                  {t("emailMe")}
                </a>
                <CopyEmailButton
                  email={site.email}
                  labels={{ copy: t("copyEmail"), copied: t("copied"), failed: t("copyFailed") }}
                />
              </div>

              <p className="mt-8 flex items-center gap-2 text-sm text-muted">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {t("basedIn", { location: tCommon("location") })}
              </p>
            </div>

            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-background/50 backdrop-blur">
              <ChannelRow
                href={`mailto:${site.email}`}
                icon={<MailIcon />}
                label={t("email")}
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
