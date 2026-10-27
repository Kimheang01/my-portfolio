#!/usr/bin/env bash
# Starts the site for the end-to-end tests: a throwaway in-memory Postgres
# (PGlite), migrated, seeded and given test users, then a production build in
# .next-e2e served on E2E_PORT. Playwright runs this (playwright.config.ts)
# and stops it afterwards. Real databases and the real build aren't touched.
set -euo pipefail
cd "$(dirname "$0")/../.."

db_log="$(mktemp)"
node_modules/.bin/pglite-server --port="$E2E_DB_PORT" --max-connections=4 >"$db_log" 2>&1 &
db=$!
# Stop the database and the site (Next.js runs as a child "next-server",
# found by its port) when Playwright stops this script.
stop() {
  lsof -ti "tcp:$E2E_PORT" | xargs kill 2>/dev/null || true
  kill "$db" 2>/dev/null || true
  rm -f "$db_log"
}
trap stop EXIT
trap 'exit 0' INT TERM
for _ in $(seq 1 60); do grep -q listening "$db_log" && break; sleep 0.5; done

# Set here, so .env.local (which Next.js and the scripts also read) can't
# point anything at a real database. PGlite answers one query at a time, so
# the app's Postgres driver is told to send one at a time.
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:$E2E_DB_PORT/postgres"
export PGMAX=1 PGMAX_PIPELINE=1 NEXT_DIST_DIR=.next-e2e

yarn -s db:migrate >/dev/null
yarn -s db:seed >/dev/null
yarn -s tsx tests/e2e/fixtures.ts
yarn -s next build >/dev/null
yarn -s next start -p "$E2E_PORT" &
wait $!
