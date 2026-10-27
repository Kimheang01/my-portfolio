import { timestamp } from "drizzle-orm/pg-core";

// When a row was added and last changed. Spread into each table.
export const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
