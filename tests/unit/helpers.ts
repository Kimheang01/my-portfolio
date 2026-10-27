import type { ZodType } from "zod";
import { fieldErrors } from "@/modules/admin/validation";

/** The fields a schema rejects for this input, sorted; [] when it's valid. */
export function rejected(schema: ZodType, input: unknown): string[] {
  const result = schema.safeParse(input);
  return result.success ? [] : Object.keys(fieldErrors(result.error)).sort();
}
