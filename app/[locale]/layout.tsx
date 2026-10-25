import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale as localeParam } from "next/root-params";
import "lenis/dist/lenis.css";
import "../globals.css";
import InlineScript from "@/components/InlineScript";
import MotionProvider from "@/components/MotionProvider";
import NeonRibbonCursor from "@/components/NeonRibbonCursor";
import SmoothScroll from "@/components/SmoothScroll";
import ThemeSync from "@/components/ThemeSync";
import { site } from "@/content/site";
import { ogLocales, routing, type Locale } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { siteUrl } from "@/lib/site-url";
import { DEFAULT_ACCENT, DEFAULT_MODE, PALETTES, themeCss, themeInitScript } from "@/lib/theme";

// Translations used by Client Components. Everything else is translated on
// the server, so its text never ships to the browser as JavaScript.
const CLIENT_NAMESPACES = ["Nav", "Language", "Theme", "Hero"] as const;

async function getLocale(): Promise<Locale> {
  const locale = await localeParam();
  if (!hasLocale(routing.locales, locale)) notFound();
  return locale;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("Metadata");
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `/${l}`]));

  return {
    metadataBase: siteUrl,
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
      languages: { ...languages, "x-default": `/${routing.defaultLocale}` },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: t("title"),
      description: t("description"),
      url: `/${locale}`,
      locale: ogLocales[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => ogLocales[l]),
    },
  };
}

export const viewport: Viewport = {
  themeColor: PALETTES[DEFAULT_MODE].background,
  colorScheme: "dark light",
};

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await getLocale();
  const messages = await getMessages();
  const clientMessages = Object.fromEntries(CLIENT_NAMESPACES.map((ns) => [ns, messages[ns]]));

  return (
    <html
      lang={locale}
      data-theme={DEFAULT_MODE}
      data-accent={DEFAULT_ACCENT}
      className={`${fontVariables} antialiased`}
      // The inline script below swaps in the visitor's saved theme before
      // React hydrates, so these attributes are expected to differ.
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss() }} />
        <InlineScript html={themeInitScript} />
      </head>
      <body>
        <NextIntlClientProvider messages={clientMessages}>
          <ThemeSync />
          <SmoothScroll />
          <MotionProvider>{children}</MotionProvider>
          <NeonRibbonCursor />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
