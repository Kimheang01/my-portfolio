import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import InlineScript from "@/components/InlineScript";
import MotionProvider from "@/components/MotionProvider";
import NeonRibbonCursor from "@/components/NeonRibbonCursor";
import SmoothScroll from "@/components/SmoothScroll";
import ThemeSync from "@/components/ThemeSync";
import { site } from "@/content/site";
import { DEFAULT_ACCENT, DEFAULT_MODE, PALETTES, themeCss, themeInitScript } from "@/lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${site.name} — ${site.role}`,
  description: site.tagline,
};

export const viewport: Viewport = {
  themeColor: PALETTES[DEFAULT_MODE].background,
  colorScheme: "dark light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme={DEFAULT_MODE}
      data-accent={DEFAULT_ACCENT}
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      // The inline script below swaps in the visitor's saved theme before
      // React hydrates, so these attributes are expected to differ.
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss() }} />
        <InlineScript html={themeInitScript} />
      </head>
      <body>
        <ThemeSync />
        <SmoothScroll />
        <MotionProvider>{children}</MotionProvider>
        <NeonRibbonCursor />
      </body>
    </html>
  );
}
