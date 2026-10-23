import { site } from "@/content/site";
import SocialIcon from "./SocialIcon";

export default function Footer() {
  const socials = site.socials.filter((social) => social.href);

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-8 text-sm text-muted sm:flex-row sm:justify-between">
        <p>© {site.name}</p>

        {socials.length > 0 && (
          <ul className="flex items-center gap-3">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-line transition hover:border-accent hover:text-foreground"
                >
                  <SocialIcon label={social.label} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}
