/**
 * Book payload validation
 */

import { ValidationError } from "@/server/core/errors/AppError";
import { bookCreateSchema } from "@/lib/validators/book";

export function validateBookPayload(data: any) {
  const parseResult = bookCreateSchema.safeParse(data);
  if (!parseResult.success) {
    throw new ValidationError(
      parseResult.error.errors[0]?.message ?? "Invalid input"
    );
  }
  return parseResult.data;
}
