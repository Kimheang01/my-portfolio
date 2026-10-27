# My Portfolio

A personal portfolio built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**,
**GSAP ScrollTrigger**, **Framer Motion** and **Lenis** smooth scrolling.

The hero is a scroll-driven image sequence drawn on a `<canvas>`: as you scroll,
the section stays pinned and plays through the frames like a video.

## Getting started

```bash
yarn
yarn dev        # http://localhost:3000
```

## Making it yours

1. **Text** — every sentence on the site is in `messages/en.json` (English)
   and `messages/km.json` (Khmer). See [Languages](#languages).
2. **Data** — `content/site.ts` holds your name, email, social links, job
   dates, project logos, tags and links. Each job and project has an `id` that
   matches its text in the message files.
3. **Project screenshots** — put images in `public/images/projects/` and set
   `image: "/images/projects/your-file.png"` on a project.
4. **Colors** — the dark/light palettes and accent presets are in
   `lib/theme.ts`.

## Languages

The site is in English (`/en`, the default) and Khmer (`/km`). Visitors switch
with the globe button in the navigation (or the toggle in the mobile menu),
and their choice is remembered in a cookie, so `/` opens their language.
Section links such as `/km/projects` open the page at that section.

- **Edit text:** change the same key in both `messages/en.json` and
  `messages/km.json`. Keep technology names, company names and job titles
  like "Full-Stack Developer" in English in both files.
- **Add a job or project:** add it to `content/site.ts` with a new `id`, then
  add `Experience.items.<id>` or `Projects.items.<id>` to both message files
  (copy an existing entry for the shape).
- **Check:** `yarn i18n:check` lists any key that is missing or extra in
  `km.json`. `yarn tsc --noEmit` catches keys used in code that don't exist in
  `en.json`.
- **Add another language:** add its code to `locales` in `i18n/routing.ts`
  (with a label in `localeLabels`), create `messages/<code>.json` from
  `en.json`. Section links such as `/<code>/projects` then work by themselves.

Khmer uses Noto Sans Khmer, which only downloads when Khmer text is on screen.
Khmer-specific line heights are under `:lang(km)` in `app/globals.css`.

## Replacing the hero frames

The frames in `public/sequence/hero/` are cut from video clips with
[ffmpeg](https://ffmpeg.org) (`brew install ffmpeg`). To replace them, pass
your clips in the order they should play. They are joined with cross-fades
and exported as 240 JPG frames:

```bash
yarn frames:video ~/Desktop/hero-3.mp4 ~/Desktop/hero-1.mp4 ~/Desktop/hero-2.mp4
```

Options: `FRAMES=300` for more frames, `QUALITY=5` for sharper (bigger)
frames, `CROP_BOTTOM=60` to trim a watermark. If you change `FRAMES`, set
`heroSequence.frameCount` in `content/site.ts` to match.

Every frame is downloaded when the page loads, so keep the total to a few MB
(240 frames at the default settings is about 7.6 MB).

`yarn frames` regenerates the original abstract placeholder frames (SVG); to
go back to those, set `frameCount: 120` and the `.svg` extension in
`content/site.ts`.

## Project structure

```
app/[locale]/   layout and page, rendered once per language
app/            global styles, 404 page, sitemap and robots.txt
components/     ScrollHero, Navbar, About, …, LanguageSwitcher, ThemeSwitcher
content/site.ts personal data and links (no translated text)
messages/       translations: en.json, km.json
i18n/           language routing and translation loading (next-intl)
proxy.ts        language redirects
lib/            theme presets, fonts and helpers
scripts/        frame generators and the translation key check
public/         images and hero frames
```

## Deploying

Push to GitHub and import the repo on [Vercel](https://vercel.com/new).
No configuration is needed: canonical URLs, hreflang links and the sitemap
use your Vercel production domain. With a custom domain, set
`NEXT_PUBLIC_SITE_URL` (e.g. `https://example.com`) in the Vercel project
settings.
