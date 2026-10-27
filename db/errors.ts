// Postgres reports a duplicate value as error 23505, and a reference to a
// row that doesn't exist as 23503; Drizzle wraps the original error.
const pgError = (error: unknown) =>
  (error as { cause?: { code?: string; constraint_name?: string } })?.cause;

/** Whether a query failed because a value broke a unique constraint. */
export function isUniqueViolation(error: unknown, constraint: string) {
  const cause = pgError(error);
  return cause?.code === "23505" && cause.constraint_name === constraint;
}

/** Whether a query failed because it pointed at a row that doesn't exist. */
export const isMissingReference = (error: unknown) => pgError(error)?.code === "23503";
