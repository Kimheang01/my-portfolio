import { createHmac } from "node:crypto";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { E2E_BASE_URL, E2E_SECRET, sessions } from "./env";

// Signs the browser in as one of the test users, with a session cookie as
// Better Auth signs it: "<token>.<HMAC-SHA256 of the token>".
async function signIn(context: BrowserContext, token: string) {
  const signature = createHmac("sha256", E2E_SECRET).update(token).digest("base64");
  await context.addCookies([
    { name: "better-auth.session_token", value: `${token}.${signature}`, url: E2E_BASE_URL, httpOnly: true },
  ]);
}

const publicPage = async (page: Page, locale: "en" | "km") => (await page.request.get(`/${locale}`)).text();
// A form field by its label. Next.js keeps the page you came from mounted
// but hidden (for instant back navigation), so only visible fields count.
const field = (page: Page, label: string) => page.getByLabel(label, { exact: true }).filter({ visible: true });

// The editor reports each save in a status message.
const saved = (page: Page, text: string) =>
  expect(page.getByRole("status").filter({ hasText: text }).first()).toBeVisible();

test.describe.configure({ mode: "serial" });

test("signed-out visitors and other GitHub accounts can't get in", async ({ page, context }) => {
  await page.goto("/admin/projects");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("button", { name: "Sign in with GitHub" })).toBeVisible();

  await signIn(context, sessions.otherAccount);
  await page.goto("/admin/projects");
  await expect(page).toHaveURL(/\/admin\/login\?error=not_allowed$/);
  await expect(page.getByRole("alert").filter({ hasText: "isn't allowed" })).toBeVisible();
});

test("a project goes from draft to published to unpublished, and the site follows", async ({ page, context }) => {
  await signIn(context, sessions.admin);

  // A draft, in English only
  await page.goto("/admin/projects/new");
  await field(page, "Title").fill("E2E Rocket");
  await field(page, "Type").fill("Web app");
  await field(page, "Context").fill("Test · 2026");
  await field(page, "Description").fill("Made by the end-to-end test.");
  await expect(field(page, "Slug")).toHaveValue("e2e-rocket");
  await expect(page.getByRole("tab", { name: /ភាសាខ្មែរ/ })).toContainText("missing text");
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page).toHaveURL(/\/admin\/projects\/\d+\/edit\?created=1$/);
  expect(await publicPage(page, "en")).not.toContain("E2E Rocket");

  // Publishing is refused while the Khmer text is missing
  await page.getByRole("button", { name: "Publish" }).click();
  await saved(page, "Check the highlighted fields");
  expect(await publicPage(page, "en")).not.toContain("E2E Rocket");

  // With the Khmer text, it's published and on the site without a rebuild
  await page.getByRole("tab", { name: /ភាសាខ្មែរ/ }).click();
  await field(page, "Title").fill("រ៉ុក្កែតសាកល្បង");
  await field(page, "Type").fill("កម្មវិធីវេប");
  await field(page, "Context").fill("សាកល្បង · 2026");
  await field(page, "Description").fill("គម្រោងសាកល្បង។");
  await page.getByRole("button", { name: "Publish" }).click();
  await saved(page, "Published");
  await expect(page.getByRole("button", { name: "Unpublish" })).toBeVisible();
  expect(await publicPage(page, "en")).toContain("E2E Rocket");
  expect(await publicPage(page, "km")).toContain("រ៉ុក្កែតសាកល្បង");

  // Unpublished, it's gone again
  await page.getByRole("button", { name: "Unpublish" }).click();
  await saved(page, "Saved as a draft");
  expect(await publicPage(page, "en")).not.toContain("E2E Rocket");
});

test("a save after the session ends is refused and goes to the login page", async ({ page, context }) => {
  await signIn(context, sessions.admin);
  await page.goto("/admin/projects");
  await page.getByRole("link", { name: "Edit E2E Rocket" }).click();
  await field(page, "Title").fill("Changed without a session");

  await context.clearCookies();
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);

  await signIn(context, sessions.admin);
  await page.goto("/admin/projects");
  await expect(page.getByRole("link", { name: "Edit E2E Rocket" })).toBeVisible();
  await expect(page.getByText("Changed without a session")).toHaveCount(0);
});
