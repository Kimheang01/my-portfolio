import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import "../globals.css";
import InlineScript from "@/components/InlineScript";
import ThemeSync from "@/components/ThemeSync";
import { fontVariables } from "@/lib/fonts";
import { DEFAULT_ACCENT, DEFAULT_MODE, PALETTES, themeCss, themeInitScript } from "@/lib/theme";
import en from "@/messages/en.json";

// The admin's own root layout, outside the [locale] segment: the interface
// is in English, while the content it edits is in every language. Moving
// between the admin and the site reloads the page.
export const metadata: Metadata = {
  title: { template: "%s · Admin", default: "Admin" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: PALETTES[DEFAULT_MODE].background,
  colorScheme: "dark light",
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html
      lang="en"
      data-theme={DEFAULT_MODE}
      data-accent={DEFAULT_ACCENT}
      className={`${fontVariables} antialiased`}
      // The inline script swaps in the saved theme before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss() }} />
        <InlineScript html={themeInitScript} />
      </head>
      <body>
        {/* The theme picker is shared with the site and translated under Theme. */}
        <NextIntlClientProvider locale="en" messages={{ Theme: en.Theme }} timeZone="Asia/Phnom_Penh">
          <ThemeSync />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
