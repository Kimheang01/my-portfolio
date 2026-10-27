#!/usr/bin/env bash
# Starts the production build (run `yarn build` first) and checks that the
# public routes still behave. Extra checks can be passed as
# "path status [redirect-or-text]" arguments, e.g. once /admin exists:
#   bash smoke-test.sh "/admin 307 /admin/login"
#
# Usage: bash .claude/skills/admin-phase/scripts/smoke-test.sh [extra checks…]
set -uo pipefail

port="${PORT:-3999}"
base="http://localhost:$port"
cd "$(git rev-parse --show-toplevel)"

log="$(mktemp)"
yarn -s start -p "$port" >"$log" 2>&1 &
server=$!
# `yarn start` runs Next.js in a child process named "next-server", so stop
# whatever is listening on the port as well as yarn itself.
trap 'lsof -ti "tcp:$port" | xargs kill 2>/dev/null; kill "$server" 2>/dev/null; rm -f "$log"' EXIT

for _ in $(seq 1 60); do
  curl -s -o /dev/null "$base/en" && break
  sleep 0.5
done

failures=0

# check PATH STATUS [EXPECT]: EXPECT is the redirect target for 3xx, or text
# the page must contain for 2xx.
check() {
  local path="$1" status="$2" expect="${3:-}" got body
  got="$(curl -s -o /dev/null -w "%{http_code} %{redirect_url}" "$base$path")"
  local code="${got%% *}" redirect="${got#* }"
  if [ "$code" != "$status" ]; then
    echo "FAIL $path: expected $status, got $code"
    failures=$((failures + 1))
    return
  fi
  if [ -n "$expect" ]; then
    if [ "${status:0:1}" = "3" ]; then
      if [ "$redirect" != "$base$expect" ]; then
        echo "FAIL $path: expected redirect to $expect, got ${redirect#"$base"}"
        failures=$((failures + 1))
        return
      fi
    else
      body="$(curl -s "$base$path")"
      if [[ "$body" != *"$expect"* ]]; then
        echo "FAIL $path: page does not contain \"$expect\""
        failures=$((failures + 1))
        return
      fi
    fi
  fi
  echo "ok   $path → $code ${expect}"
}

check / 307 /en
check /en 200 'lang="en"'
check /km 200 'lang="km"'
check /km 200 'ភ្នំពេញ'
check /km/projects 307 '/km#projects'
check /sitemap.xml 200 '/km'
check /robots.txt 200 'Sitemap'

for extra in "$@"; do
  # shellcheck disable=SC2086
  check $extra
done

if [ "$failures" -gt 0 ]; then
  echo "$failures check(s) failed. Server log:"
  tail -20 "$log"
  exit 1
fi
echo "All route checks passed."
