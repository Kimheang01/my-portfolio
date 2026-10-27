// Adds the test users to the end-to-end database: the allowlisted GitHub
// account and another one, each with a signed-in session.
// Run by tests/e2e/server.sh after the migrations and seed.
import postgres from "postgres";
import { sessions } from "./env";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const tomorrow = new Date(Date.now() + 86_400_000);
  await sql`insert into "user" (id, name, email, email_verified) values
    ('e2e_admin', 'E2E Admin', 'admin@e2e.test', true), ('e2e_other', 'E2E Other', 'other@e2e.test', true)`;
  await sql`insert into account (id, account_id, provider_id, user_id) values
    ('e2e_admin_github', ${process.env.ADMIN_GITHUB_ID!}, 'github', 'e2e_admin'),
    ('e2e_other_github', '999', 'github', 'e2e_other')`;
  await sql`insert into session (id, token, user_id, expires_at) values
    ('e2e_admin_session', ${sessions.admin}, 'e2e_admin', ${tomorrow}),
    ('e2e_other_session', ${sessions.otherAccount}, 'e2e_other', ${tomorrow})`;
  await sql.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
