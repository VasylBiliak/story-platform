/**
 * Book service - orchestrates parsing, validation, permissions, and repository calls
 */

import { NextRequest } from "next/server";
import { UnauthorizedError } from "@/server/core/errors/AppError";
import { parseBookRequest } from "./book.parser";
import { validateBookPayload } from "./book.validator";
import { ensureBookOwner } from "./book.permissions";
import { mapToCreatePayload, mapToUpdatePayload } from "./book.mapper";
import { createBook, updateBook, deleteBook, getBooks, getBookById, getBooksWithPagination } from "@/server/services/bookService";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { PaginationParams } from "@/types";
import { handleBookLimit } from "@/server/modules/limits/limits.guard";

/**
 * Create a new book
 */
export async function createBookService(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new UnauthorizedError();
  }

  const { body } = await parseBookRequest(req);
  const validatedData = validateBookPayload(body);

  // Enforce chapter limit (max 5)
  if (validatedData.chapters && validatedData.chapters.length > 5) {
    return {
      error: "Chapter limit reached",
      message: "Maximum number of chapters per book is 5.",
      status: 400,
    };
  }

  // Enforce image limit (max 3 per chapter)
  if (validatedData.chapters && validatedData.chapters.some((c: any) => c.images && c.images.length > 3)) {
    return {
      error: "Image limit reached",
      message: "Maximum number of images per chapter is 3.",
      status: 400,
    };
  }

  // Book limit: delete oldest if needed
  const limitResult = await handleBookLimit(user.id);

  const mappedData = mapToCreatePayload(validatedData, user.name || user.email);
  const book = await createBook(user.id, mappedData);

  if (limitResult) {
    return {
      message: "Book limit reached. Your oldest book was replaced because this is a demo environment.",
      maxBooks: 3,
      replacedBookId: limitResult.removedBookId,
      createdBook: book,
      status: 201,
    };
  }

  return {
    message: "Book created successfully.",
    maxBooks: 3,
    createdBook: book,
    status: 201,
  };
}

/**
 * Update an existing book
 */
export async function updateBookService(req: NextRequest, bookId: string) {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new UnauthorizedError();
  }

  const { body, uploadedChapterImages } = await parseBookRequest(req);
  const validatedData = validateBookPayload(body);

  await ensureBookOwner(bookId, user.id);

  const mappedData = mapToUpdatePayload(validatedData);

  const updatedBook = await updateBook(bookId, mappedData, uploadedChapterImages && uploadedChapterImages.length > 0 ? uploadedChapterImages : undefined);

  return updatedBook;
}

/**
 * Delete a book
 */
export async function deleteBookService(req: NextRequest, bookId: string) {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new UnauthorizedError();
  }

  await ensureBookOwner(bookId, user.id);
  await deleteBook(bookId);

  return { message: "Book deleted" };
}

/**
 * Get all books (non-paginated, for backward compatibility)
 */
export async function listBooksService() {
  return getBooks();
}

/**
 * Get paginated books
 */
export async function listBooksPaginatedService(params: PaginationParams = {}) {
  return getBooksWithPagination(params);
}

/**
 * Get a book by ID
 */
export async function getBookByIdService(bookId: string) {
  const book = await getBookById(bookId);
  if (!book) {
    throw new Error("Book not found");
  }
  return book;
}
