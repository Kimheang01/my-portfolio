---
description: How the my-portfolio admin dashboard is built — branch policy, one phase at a time with an approval gate, commits, database and secrets safety
alwaysApply: true
---

# Admin dashboard workflow

The admin dashboard is built in phases. The plan, its decisions and the
current status are in `docs/admin-dashboard-implementation-plan.md`; the
requirements are in `docs/admin-dashboard-spec.md`. Read the plan before
doing admin work, because it records decisions the spec doesn't (integer
ids, one experiences table, root-level folders, and so on).

For starting, finishing, verifying, reporting or committing a phase, use the
`admin-phase` skill — it has the full procedure.

## One phase at a time

- Work only on the phase the user approved. If something belongs to a later
  phase, note it in the report instead of building it, so each phase stays
  reviewable on its own.
- After a phase: run the checks, report, and stop. Wait for the user to
  approve before committing and before starting the next phase. The user
  reviews every phase; moving on without approval takes that away.
- Don't add dependencies the plan doesn't list for the current phase without
  saying why in the report. If the plan turns out wrong, propose the change
  instead of quietly doing something else.

## Branches and commits

- All admin phases go on `feat/admin-dashboard`. `main` stays as the live
  site until the dashboard is ready (or a milestone the user picks).
- Fixes unrelated to the dashboard (for example the language PR review
  issues) go on their own branch (`fix/...`) from `main`, so they can ship
  without waiting for the dashboard.
- Never commit or push to `main` directly.
- Commit once per approved phase, as `feat(<scope>): Phase N – <summary>`,
  e.g. `feat(db): Phase 1 – schema, migration and seed`. Small follow-up
  fixes after approval can be separate commits with the same scope.
- Stage files by name and check `git status` first; never stage `.env*`
  files other than `.env.example`.
- Push only when the user asks.

## Database and secrets

- Never print, log or commit `DATABASE_URL` or any other secret, and don't
  ask the user to paste one into the chat. They go in `.env.local`, which
  git ignores.
- Change the schema in `db/schema/`, then `yarn db:generate`. Never edit a
  migration that has run on a real database; add a new one instead. A
  migration that has only run on a throwaway local database (PGlite) may be
  regenerated.
- Never run `db:migrate` or `db:seed` against production unless the user
  asks for it in that moment.
- The seed only adds missing rows. Keep it that way, so re-running it never
  overwrites content edited in the admin.

## Next.js 16

This project uses Next.js 16 with `cacheComponents: true`. Before using a
Next.js API (caching, `updateTag`, `proxy.ts`, layouts, server actions),
read its guide in `node_modules/next/dist/docs/`, as `AGENTS.md` says.
APIs differ from older versions.
