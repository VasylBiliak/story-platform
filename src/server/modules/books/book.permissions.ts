/**
 * Book permission checks
 */

import { UnauthorizedError, NotFoundError } from "@/server/core/errors/AppError";
import { getBookById } from "@/server/services/bookService";

export async function ensureBookOwner(bookId: string, userId: string) {
  const book = await getBookById(bookId);
  if (!book) {
    throw new NotFoundError("Book not found");
  }
  if (book.ownerId !== userId) {
    throw new UnauthorizedError("You do not own this book");
  }
  return book;
}
