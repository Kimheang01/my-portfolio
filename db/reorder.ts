import { asc, eq } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { db } from "./index";

type Ordered = PgTable & { id: PgColumn; sortOrder: PgColumn };

/**
 * Swaps a row with its neighbour in a table ordered by sortOrder, and
 * renumbers the rows from 0. False if the row is missing or already at
 * that end of the list.
 */
export async function moveRow(table: Ordered, id: number, direction: "up" | "down") {
  return db.transaction(async (tx) => {
    const rows = await tx
      .select({ id: table.id })
      .from(table as PgTable)
      .orderBy(asc(table.sortOrder), asc(table.id))
      .for("update");
    const ids = rows.map((row) => row.id as number);
    const from = ids.indexOf(id);
    const to = direction === "up" ? from - 1 : from + 1;
    if (from === -1 || to < 0 || to >= ids.length) return false;
    [ids[from], ids[to]] = [ids[to], ids[from]];
    for (const [sortOrder, rowId] of ids.entries()) {
      await tx.update(table).set({ sortOrder } as never).where(eq(table.id, rowId));
    }
    return true;
  });
}
