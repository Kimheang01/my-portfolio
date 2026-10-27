// Tables Better Auth (lib/auth.ts) reads and writes for the admin login.
// Their shape is set by Better Auth: ids are random strings it generates,
// and the names match its defaults. Only the allowlisted GitHub account
// (ADMIN_GITHUB_ID) ever gets a row here; see lib/auth.ts.
import { boolean, index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { timestamps } from "./columns";

const at = () => timestamp({ withTimezone: true });

export const user = pgTable("user", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  image: text(),
  ...timestamps,
});

export const session = pgTable(
  "session",
  {
    id: text().primaryKey(),
    expiresAt: at().notNull(),
    /** The value of the session cookie */
    token: text().notNull().unique(),
    ipAddress: text(),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [index().on(t.userId)],
);

// A sign-in method of a user, here always GitHub: accountId is the GitHub
// account's numeric id.
export const account = pgTable(
  "account",
  {
    id: text().primaryKey(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: at(),
    refreshTokenExpiresAt: at(),
    scope: text(),
    password: text(),
    ...timestamps,
  },
  (t) => [index().on(t.userId), uniqueIndex().on(t.providerId, t.accountId)],
);

// Short-lived values, such as the OAuth state while signing in with GitHub.
export const verification = pgTable(
  "verification",
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: at().notNull(),
    ...timestamps,
  },
  (t) => [index().on(t.identifier)],
);
