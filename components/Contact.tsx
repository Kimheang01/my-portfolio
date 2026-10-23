import { site } from "@/content/site";
import Reveal from "./Reveal";

export default function Contact() {
  const socials = site.socials.filter((social) => social.href);

  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-32">
      <Reveal className="rounded-3xl border border-line bg-gradient-to-br from-accent/20 via-transparent to-transparent px-8 py-20 text-center sm:px-16">
        <p className="font-mono text-sm tracking-widest text-accent uppercase">
          Contact
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Let&apos;s build something together.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-muted">
          Have a project in mind or want to work together? Send me an email.
          I&apos;m based in {site.location}.
        </p>
        <a
          href={`mailto:${site.email}`}
          className="mt-10 inline-block rounded-full bg-foreground px-8 py-4 font-medium text-background transition hover:bg-accent hover:text-foreground"
        >
          {site.email}
        </a>
        {socials.length > 0 && (
          <ul className="mt-10 flex justify-center gap-6 text-sm text-muted">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-foreground"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </Reveal>
    </section>
  );
}
