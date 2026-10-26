---
name: admin-phase
description: Runs one phase of the my-portfolio admin dashboard build from start to approval — orient on the branch and plan, implement only that phase, run TypeScript, lint, i18n, build, database and route checks, report in a fixed format, then wait for approval and commit. Use this whenever the user wants to start, continue, finish, check, report on or commit an admin dashboard phase ("start Phase 2", "is Phase 3 done?", "commit this phase", "run the checks", "what's next for the dashboard?"), and whenever work touches feat/admin-dashboard, db/, modules/, app/admin or the dashboard plan, even if the word "phase" isn't used.
---

# Admin dashboard phase

Build the admin dashboard one reviewable phase at a time. The user approves
every phase before it's committed and before the next one starts, so each
report has to give them what they need to decide: what passed, what changed,
what differs from the plan, and what they must do themselves.

The plan, decisions and phase status: `docs/admin-dashboard-implementation-plan.md`.
Requirements: `docs/admin-dashboard-spec.md`. Policy (branches, commits,
secrets): `.claude/rules/admin-dashboard.md`.

## 1. Orient

1. `git branch --show-current` and `git status --short`. Admin work belongs
   on `feat/admin-dashboard`; if you're elsewhere, say so and switch only
   with a clean tree (or ask). Uncommitted files from an earlier phase mean
   that phase hasn't been committed yet — mention it rather than mixing it
   into the new phase.
2. Read the plan's **Status** table and the section for the phase. Confirm
   the user approved this phase. If they asked for a phase whose earlier
   phases aren't approved, point that out before starting.
3. Read the code the phase touches before changing it, and the Next.js guide
   in `node_modules/next/dist/docs/` for every Next.js API you'll use
   (caching, `updateTag`, `proxy.ts`, layouts, server actions). Next.js 16
   with `cacheComponents: true` behaves differently from older versions.
4. Check what the phase needs from the user (a `DATABASE_URL`, an OAuth app,
   a decision from the plan's "Still open" list). If a missing item blocks
   the phase, ask before writing code; if it only blocks verification, build
   and verify as far as possible and list it under "What you need to do".

## 2. Implement

- Stay inside the phase. Something that belongs to a later phase goes in the
  report under "Changes from the plan" or "Next", not in the code.
- Follow the plan's decisions (integer identity ids, `*_translations` tables,
  root-level folders, zod on every action, `requireAdmin()` in every admin
  page and action). If a decision turns out wrong for the code you find,
  stop and propose the change.
- Match the surrounding code: short plain-language comments explaining why,
  the same naming, no new styling systems.
- Add a dependency only if the plan lists it for this phase, or explain why
  in the report. Check the installed version's API in `node_modules` instead
  of relying on memory.
- Schema changes: edit `db/schema/`, run `yarn db:generate --name <what>`,
  and read the generated SQL.

## 3. Check

Run all of these and keep the actual output for the report. A failing check
is reported as failing, with the error, never smoothed over.

| Check | Command | When |
| --- | --- | --- |
| TypeScript | `yarn -s tsc --noEmit` | Always |
| Lint | `yarn -s lint` | Always |
| Translations | `yarn -s i18n:check` | Always |
| Build | `yarn -s build` | Always. From Phase 2 on it needs a reachable `DATABASE_URL` |
| Database | `bash .claude/skills/admin-phase/scripts/check-db.sh` | When `db/`, `drizzle/` or `scripts/seed.ts` changed |
| Routes | `bash .claude/skills/admin-phase/scripts/smoke-test.sh [extra checks]` | Always, after the build |

- `check-db.sh` migrates and seeds twice against a throwaway in-memory
  Postgres (PGlite). It passes when the second seed prints `Added: nothing.`
  When the phase changes what the seed writes, also query the result (row
  counts, a Khmer value) the way Phase 1 did, and try a few writes the
  database should reject.
- `smoke-test.sh` covers the public routes. Pass extra checks for routes the
  phase adds, e.g. `"/admin 307 /admin/login"` once Phase 3 exists.
- If the phase changes anything visitors see (Phase 2 especially), compare
  `/en` and `/km` at phone and desktop widths with the baseline screenshots.
  The page should look identical unless the phase meant to change it.
- Fix failures that come from this phase's code and rerun. If a failure
  predates the phase, report it and leave it.

## 4. Report

Use this structure so every phase reads the same way:

```markdown
Phase N is finished. <one sentence: what now works, and anything important about the state, e.g. "the public site doesn't use it yet" or "nothing is committed">.

## Checks
| Check | Result |
|---|---|
| TypeScript | ✅ Passed |
| … | ✅ / ❌ with the short reason |

## What was built
1. **<Part>**: what it does, in plain words; the key rule or safety it adds.

## Changes from the plan
- **<Change>:** what and why. (Write "None." if there are none.)

## Files
**Modified:** …
**Created:** …
**New dependencies:** runtime: …; development: …

## What you need to do
1. Steps only the user can do (accounts, secrets in `.env.local`, decisions), with exact commands and the output to expect.

Approve Phase N to commit it and start Phase N+1, which <one line>.
```

Then update the plan's **Status** table (e.g. "Done, awaiting approval") and
stop. Don't commit and don't start the next phase.

## 5. On approval: commit

When the user approves:

1. `git status --short` and review `git diff --stat`. Everything listed
   should belong to this phase.
2. Stage files by name (never `.env*` other than `.env.example`), set the
   plan's status for the phase to "Done", and commit:

   ```
   feat(<scope>): Phase N – <summary>

   <2–4 lines: what the phase adds and anything notable>
   ```

   Scopes: `db`, `site`, `auth`, `admin`, `media`, `docs`, `test`. End the
   message with the attribution trailer the session specifies.
3. Report the commit hash and subject. Push only if the user asks.
4. Start the next phase only when the user says so.
