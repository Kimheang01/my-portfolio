/** Whether a query failed because a value broke a unique constraint. */
export function isUniqueViolation(error: unknown, constraint: string) {
  // Postgres reports a duplicate value as error 23505; Drizzle wraps it.
  const cause = (error as { cause?: { code?: string; constraint_name?: string } })?.cause;
  return cause?.code === "23505" && cause.constraint_name === constraint;
}
