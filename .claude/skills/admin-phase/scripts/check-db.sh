#!/usr/bin/env bash
# Runs the migrations and the seed (twice) against a throwaway in-memory
# Postgres (PGlite), so schema and seed changes can be checked without a
# real database. Nothing is written to the project or to any real database.
#
# Usage: bash .claude/skills/admin-phase/scripts/check-db.sh [port]
# Pass when: migrations apply, the first seed adds rows, and the second seed
# adds nothing ("Added: nothing.").
set -euo pipefail

port="${1:-54329}"
project="$(git rev-parse --show-toplevel)"

log="$(mktemp)"
# PGlite is a development dependency of the project (yarn installs it).
"$project/node_modules/.bin/pglite-server" --port="$port" >"$log" 2>&1 &
server=$!
# The server doesn't stop on its own, so always stop it on the way out.
trap 'kill "$server" 2>/dev/null; rm -f "$log"' EXIT

for _ in $(seq 1 60); do
  grep -q listening "$log" && break
  sleep 0.5
done
grep -q listening "$log" || { echo "PGlite did not start:"; cat "$log"; exit 1; }

# Set for these commands only. @next/env never overrides a variable that's
# already set, so .env.local's database is not touched.
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:$port/postgres"
cd "$project"
echo "== db:migrate"
yarn -s db:migrate
echo
echo "== db:seed (first run)"
yarn -s db:seed
echo "== db:seed (second run: should add nothing)"
second="$(yarn -s db:seed)"
echo "$second"
[[ "$second" == *"Added: nothing."* ]] || { echo "FAIL: the second seed run added rows"; exit 1; }
echo "Database check passed."
