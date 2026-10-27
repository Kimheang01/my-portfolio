import { defineConfig } from "@playwright/test";
import { E2E_BASE_URL, e2eServerEnv } from "./tests/e2e/env";

// End-to-end tests: yarn test:e2e. They start their own site and database
// (tests/e2e/server.sh), so nothing real is read or changed.
export default defineConfig({
  testDir: "tests/e2e",
  // One database shared by the tests, so they run one after another.
  workers: 1,
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: E2E_BASE_URL,
    // The Chrome installed on this computer; `npx playwright install chromium`
    // and PW_CHANNEL=chromium use Playwright's own instead (e.g. in CI).
    channel: process.env.PW_CHANNEL ?? "chrome",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "bash tests/e2e/server.sh",
    url: `${E2E_BASE_URL}/en`,
    env: e2eServerEnv,
    // Migrating, seeding and building take a minute or two.
    timeout: 300_000,
    reuseExistingServer: false,
    stdout: "pipe",
  },
});
