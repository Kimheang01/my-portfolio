import { useTranslations } from "next-intl";
import type { Social } from "@/modules/portfolio/types";
import SocialIcon from "./SocialIcon";

export default function Footer({ name, socials }: { name: string; socials: Social[] }) {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-sm text-muted sm:flex-row sm:justify-between">
        <p>{t("copyright", { name })}</p>

        {socials.length > 0 && (
          <ul className="flex items-center gap-3">
            {socials.map((social) => (
              <li key={social.platform}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.platform}
                  title={social.platform}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line transition hover:border-accent hover:text-foreground active:border-accent active:text-foreground"
                >
                  <SocialIcon platform={social.platform} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}
