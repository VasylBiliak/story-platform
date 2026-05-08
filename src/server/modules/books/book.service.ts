/**
 * Book service - orchestrates parsing, validation, permissions, and repository calls
 */

import { NextRequest } from "next/server";
import { UnauthorizedError } from "@/server/core/errors/AppError";
import { parseBookRequest } from "./book.parser";
import { validateBookPayload } from "./book.validator";
import { ensureBookOwner } from "./book.permissions";
import { mapToCreatePayload, mapToUpdatePayload } from "./book.mapper";
import { createBook, updateBook, deleteBook, getBooks, getBookById } from "@/server/services/bookService";
import { getCurrentUser } from "@/lib/getCurrentUser";

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

  const mappedData = mapToCreatePayload(validatedData, user.name || user.email);

  const book = await createBook(user.id, mappedData);

  return book;
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
 * Get all books
 */
export async function listBooksService() {
  return getBooks();
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
