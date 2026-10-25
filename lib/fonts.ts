import { Geist, Geist_Mono, Noto_Sans_Khmer } from "next/font/google";

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Used for Khmer characters on both languages (the font stacks in
// globals.css fall back to it). Only the Khmer subset is loaded, and only
// when Khmer text is on screen, so English visitors don't download it.
export const notoSansKhmer = Noto_Sans_Khmer({
  variable: "--font-noto-khmer",
  subsets: ["khmer"],
  display: "swap",
  preload: false,
});

export const fontVariables = `${geistSans.variable} ${geistMono.variable} ${notoSansKhmer.variable}`;
