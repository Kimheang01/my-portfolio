# Admin Dashboard — Implementation Plan

The approved plan for building the admin dashboard described in
[admin-dashboard-spec.md](./admin-dashboard-spec.md). Where the two differ,
this plan wins: it reflects how the existing code actually works.

## Status

| Phase | Name | Status |
| --- | --- | --- |
| 0 | Prerequisites | Language PR merged (#5); review fixes still open (separate branch) |
| 1 | Data foundation | Done (b8d3479) |
| 2 | Public site reads from the database | Done |
| 3 | Login and admin shell | Done |
| 4 | Projects end to end | Done |
| 5 | Other content | Done |
| 6 | Media | Done |
| 7 | Hardening | Not started |

Update this table whenever a phase starts, finishes or is approved.

## Decisions

| Topic | Decision |
| --- | --- |
| Architecture | Modular monolith inside this Next.js app; no separate API |
| Folder layout | Root-level folders (`app/`, `components/`, `lib/`, `db/`, `modules/`); no `src/` |
| Database | PostgreSQL via Drizzle ORM + `postgres` driver; Neon recommended |
| IDs | Auto-increment integers (`generatedAlwaysAsIdentity`); public URLs use slugs |
| Translations | `*_translations` tables, one row per `(id, locale)`; locales `en`, `km` |
| UI strings | Stay in `messages/*.json` (labels, buttons, headings, format strings) |
| Editable content | Moves to the database (profile, hero, about, socials, skills, experience, projects, SEO) |
| Education | One `experiences` table with `kind: work \| education` |
| Login | Better Auth + GitHub OAuth, one allowlisted GitHub account ID |
| Validation | zod on every server action |
| Forms / UI | React 19 `useActionState` + Tailwind + native `<dialog>`; no shadcn or React Hook Form unless needed |
| Media | Vercel Blob (chosen in Phase 6: no extra account on Vercel, and next/image already resizes); existing `/public` images are `local` media rows |
| Description format | Plain text |
| Deferred | Project gallery, full descriptions, project detail pages, blog, inbox, analytics |
| Branches | All phases on `feat/admin-dashboard`, one commit per phase; unrelated fixes on their own branches |

Hosting: Vercel (confirmed). Admin GitHub account: `Kimheang01`, id 172888373. Media: Vercel Blob. Nothing open.

## Phases

### Phase 0 — Prerequisites
- Fix the language PR review issues on `fix/i18n-review` (top two: empty
  `NEXT_PUBLIC_SITE_URL` crashes the build in `lib/site-url.ts`; `#hash`
  trailing slash when switching language).
- Baseline screenshots of `/en` and `/km` at phone and desktop widths.

### Phase 1 — Data foundation
- `db/schema/*`, `db/client.ts`, `db/index.ts` (server-only), `drizzle.config.ts`,
  `drizzle/` migrations, `scripts/seed.ts`, `.env.example`, `db:*` scripts.
- Done when: migrate + seed fills every current item in both languages, and a
  second seed run changes nothing.

### Phase 2 — Public site reads from the database (looks identical)
- `modules/portfolio/public.ts`: `getPortfolio(locale)` with `'use cache'`,
  `cacheTag("portfolio")`, `cacheLife("max")`; published content only.
- `app/[locale]/page.tsx` loads it once and passes props to `About`,
  `Experience`, `Projects`, `Contact`, `Footer`, `Navbar`, `ScrollHero`
  (client component: serializable props only). `generateMetadata` reads SEO
  settings.
- Extract `components/ProjectCard.tsx` from `Projects.tsx`.
- Remove content keys from `messages/*.json`; `content/site.ts` keeps only
  `heroSequence`.
- The seed's source moves to `scripts/seed-data/` (the removed message keys
  and the old `content/site.ts` data), so a fresh database can still be filled.
- Done when: tsc, lint, `i18n:check` and build pass, and both languages match
  the baseline screenshots.

### Phase 3 — Login and admin shell
- `lib/auth.ts` (Better Auth, GitHub, Drizzle adapter, no email sign-up,
  allowlist hook), `lib/authorization.ts` (`requireAdmin()`, server-only),
  `app/api/auth/[...all]/route.ts`, `lib/auth-actions.ts` (sign in and out
  as server actions, so no auth client ships to the browser).
- `app/admin/layout.tsx`: its own root layout reusing `themeCss()`,
  `themeInitScript`, `ThemeSync`, `fontVariables`; robots noindex.
- `app/admin/login/page.tsx`, `(dashboard)` layout with sidebar and header,
  overview page.
- `proxy.ts`: `/admin` skips next-intl; optimistic cookie check only.
  `app/robots.ts`: disallow `/admin`.
- Done when: signed-out visitors and other GitHub accounts are refused, and
  every admin page and action calls `requireAdmin()`.

### Phase 4 — Projects end to end
- `modules/projects/` (schema, repository, service, actions): slug, 6-digit
  hex color, https links, both languages required to publish; actions call
  `requireAdmin()` → service → `updateTag("portfolio")`.
- List, new, edit (EN/KM tabs, missing-translation marker), preview with
  `ProjectCard`, publish, unpublish, archive, reorder.
- Done when: a project published in `/admin` appears on `/en` and `/km`
  without a deploy, and drafts never appear publicly.

### Phase 5 — Other content
- Profile (hero, about), socials and SEO settings, skills, experience and
  education, each following the projects module pattern.

### Phase 6 — Media
- Signed direct uploads to the chosen provider (not through server actions),
  `media` rows, `MediaPicker`, block deleting media that published content
  uses, `images.remotePatterns` in `next.config.ts`.

### Phase 7 — Hardening
- Tests for schemas and services, one end-to-end test of the publish flow,
  security review, README, production environment variables, backup before
  migrations, separate dev and prod databases.

## Integration notes

- `proxy.ts` sends everything through next-intl; `/admin` must be handled first.
- `/admin` is a second root layout: moving between it and the site reloads the page.
- `next/root-params` `locale()` has no value under `/admin`; admin code must not rely on it.
- With `cacheComponents: true`, database reads must be inside `'use cache'`,
  and session reads must sit behind `<Suspense>`.
- `DATABASE_URL` must be reachable during `yarn build` from Phase 2 on.
- `updateTag` only works in server actions; route handlers use `revalidateTag`.
- `project.color` must be `#rrggbb`: the card appends alpha digits.
- Admin root layout needs `fontVariables`; Khmer inputs need `lang="km"`.
- Read the guide in `node_modules/next/dist/docs/` before using any Next.js API (see `AGENTS.md`).
