/**
 * Chapter permission checks
 */

import { UnauthorizedError, NotFoundError } from "@/server/core/errors/AppError";
import { getBookById } from "@/server/services/bookService";
import { getBookIdByChapterRepository, chapterExistsRepository } from "./chapter.repository";

export async function ensureChapterOwner(chapterId: string, userId: string) {
  const bookId = await getBookIdByChapterRepository(chapterId);
  if (!bookId) {
    throw new NotFoundError("Chapter not found");
  }

  const book = await getBookById(bookId);
  if (!book) {
    throw new NotFoundError("Book not found");
  }

  if (book.ownerId !== userId) {
    throw new UnauthorizedError("You do not own this chapter");
  }

  return bookId;
}

export async function ensureChapterExists(chapterId: string) {
  const exists = await chapterExistsRepository(chapterId);
  if (!exists) {
    throw new NotFoundError("Chapter not found");
  }
}
