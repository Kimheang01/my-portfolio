# My Portfolio

A personal portfolio built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**,
**GSAP ScrollTrigger**, **Framer Motion** and **Lenis** smooth scrolling.

The hero is a scroll-driven image sequence drawn on a `<canvas>`: as you scroll,
the section stays pinned and plays through the frames like a video.

## Getting started

The content is in a PostgreSQL database (Neon works well), so set one up first:

```bash
yarn
cp .env.example .env.local   # then set DATABASE_URL in .env.local
yarn db:migrate              # creates the tables
yarn db:seed                 # fills them with the content in scripts/seed-data/
yarn dev                     # http://localhost:3000
```

Setting up again on another computer, with the existing database? See
[docs/new-computer-setup.md](docs/new-computer-setup.md).

## Making it yours

1. **Content** — your profile, hero text, about, skills, experience,
   projects, social links and the SEO title and description are in the
   database, in English and Khmer. Edit them in the
   [admin dashboard](#admin-dashboard); changes show on the site as soon as
   they're saved or published, without a redeploy.
2. **Interface text** — headings, labels and buttons are in
   `messages/en.json` (English) and `messages/km.json` (Khmer). See
   [Languages](#languages).
3. **Images** — upload them in the admin (Media, or the image fields on the
   Profile and project pages). They're stored in Vercel Blob; the site's
   original images in `public/` are in the same library.
4. **Colors** — the dark/light palettes and accent presets are in
   `lib/theme.ts`.

## Admin dashboard

`/admin` is where the site's content is edited. You sign in with GitHub,
and only one GitHub account (by its numeric id, `ADMIN_GITHUB_ID`) gets in;
there's no sign-up and no password login.

To set it up, create a GitHub OAuth app (GitHub → Settings → Developer
settings → OAuth Apps → New OAuth App) with the callback URL
`http://localhost:3000/api/auth/callback/github`, then fill in the admin
section of `.env.local` (see `.env.example`) and run `yarn db:migrate`. For
production, create a second OAuth app with your domain's callback URL and set
the same variables on Vercel.

Image uploads need a Vercel Blob store: in the Vercel project, Storage →
Create → Blob, connected to every environment. Vercel adds
`BLOB_READ_WRITE_TOKEN` itself; for local uploads, copy it into `.env.local`.

## Languages

The site is in English (`/en`, the default) and Khmer (`/km`). Visitors switch
with the globe button in the navigation (or the toggle in the mobile menu),
and their choice is remembered in a cookie, so `/` opens their language.
Section links such as `/km/projects` open the page at that section.

- **Edit interface text:** change the same key in both `messages/en.json`
  and `messages/km.json`.
- **Edit content:** each table with text has a `*_translations` table with
  one row per language (`en`, `km`). Keep technology names, company names
  and job titles like "Full-Stack Developer" in English in both.
- **Check:** `yarn i18n:check` lists any key that is missing or extra in
  `km.json`. `yarn tsc --noEmit` catches keys used in code that don't exist in
  `en.json`.
- **Add another language:** add its code to `locales` in `i18n/routing.ts`
  (with a label in `localeLabels`) and to `localeEnum` in
  `db/schema/content.ts` (then `yarn db:generate`), and create
  `messages/<code>.json` from `en.json`. Section links such as
  `/<code>/projects` then work by themselves.

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
app/[locale]/       layout and page, rendered once per language
app/                global styles, 404 page, sitemap and robots.txt
components/         ScrollHero, Navbar, About, …, LanguageSwitcher, ThemeSwitcher
modules/portfolio/  reads the site's content from the database
db/                 database schema and connection (Drizzle ORM)
drizzle/            database migrations (yarn db:generate)
content/site.ts     hero frame settings
messages/           interface text: en.json, km.json
i18n/               language routing and translation loading (next-intl)
proxy.ts            language redirects
app/admin/          admin dashboard (its own layout; sign-in at /admin/login)
lib/                theme presets, fonts, helpers and admin login (auth.ts)
scripts/            seed (and its content in seed-data/), frame generators,
                    translation key check
public/             images and hero frames
```

## Tests

```bash
yarn test       # the admin's form rules (Node's test runner, a few seconds)
yarn test:e2e   # signs in, publishes a project and checks the site (Playwright)
```

`yarn test:e2e` starts its own copy of the site on a throwaway in-memory
database (PGlite) and builds it into `.next-e2e`, so it never touches your
database or your normal build. It uses the Google Chrome on your computer;
without Chrome, run `npx playwright install chromium` and
`PW_CHANNEL=chromium yarn test:e2e`.

## Deploying

Push to GitHub and import the repo on [Vercel](https://vercel.com/new). The
pages are built from the database, so every build needs `DATABASE_URL`.
Canonical URLs, hreflang links and the sitemap use your Vercel production
domain; with a custom domain, set `NEXT_PUBLIC_SITE_URL` (e.g.
`https://example.com`).

### Before the admin goes live

1. **A production GitHub OAuth app.** The local one only allows
   `localhost`. Create another with Homepage URL `https://<your domain>` and
   callback URL `https://<your domain>/api/auth/callback/github`.
2. **Production environment variables on Vercel** (Settings → Environment
   Variables, Production):
   - `BETTER_AUTH_URL` = `https://<your domain>`
   - `BETTER_AUTH_SECRET` = a new random value (`openssl rand -base64 32`),
     not the one in `.env.local`
   - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` from the production OAuth app
   - `ADMIN_GITHUB_ID` (your GitHub account's numeric id)
   - `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` (already set if you followed
     the steps above)

   Preview deployments get their own addresses, which the OAuth app doesn't
   allow, so the admin login only works in production. The public site works
   everywhere.
3. **Migrations before the deploy that needs them.** Run `yarn db:migrate`
   against the production database first. Make a backup right before: in
   Neon, create a branch of the database (it's an instant copy); to undo,
   restore from that branch.
4. **After deploying:** open `/en` and `/km`, sign in at `/admin`, change
   something small and check it appears on the site.

### A separate database for development

Your computer and the live site should not share a database: anything you
try locally would show on the live site. In Neon, create a `dev` branch of
the database and put its connection string in `.env.local`; keep the main
branch's in Vercel's production settings. Run `yarn db:migrate` on both when
a new migration is added.

### Logs

Every change made in the admin is written to the server log as one line
like `{"event":"admin_change","action":"project.save","id":5,...}`. On Vercel,
search the project's Logs for `admin_change`.
