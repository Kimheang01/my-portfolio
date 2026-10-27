// Settings for the end-to-end test server only. None of these are real:
// the server runs on a throwaway in-memory database and is stopped after
// the tests, and GitHub and Blob are never called.
export const E2E_PORT = 3100;
export const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;
export const E2E_SECRET = "e2e-only-secret-not-used-anywhere-else-0123456789";

export const e2eServerEnv = {
  E2E_PORT: String(E2E_PORT),
  E2E_DB_PORT: "54333",
  BETTER_AUTH_URL: E2E_BASE_URL,
  BETTER_AUTH_SECRET: E2E_SECRET,
  GITHUB_CLIENT_ID: "e2e-client-id",
  GITHUB_CLIENT_SECRET: "e2e-client-secret",
  ADMIN_GITHUB_ID: "172888373",
  BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_e2eteststore000_e2esecret",
};

/** Session tokens tests/e2e/fixtures.ts creates. */
export const sessions = { admin: "e2e_admin_session", otherAccount: "e2e_other_session" } as const;
