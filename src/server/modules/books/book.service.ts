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
import { LimitsService } from "@/server/modules/limits/limits.service";

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

  // Enforce chapter limit based on user's plan
  const userPlan = (user.plan as 'FREE' | 'CREATOR' | 'AUTHOR') || 'FREE';
  const maxChapters = LimitsService.getPlan(userPlan).chapter.maxChaptersPerBook;
  const maxImages = LimitsService.getPlan(userPlan).chapter.maxImagesPerChapter;

  if (validatedData.chapters && validatedData.chapters.length > maxChapters) {
    return {
      error: "Chapter limit reached",
      message: `Maximum number of chapters per book for ${userPlan} plan is ${maxChapters}.`,
      status: 400,
    };
  }

  // Enforce image limit based on user's plan
  if (validatedData.chapters && validatedData.chapters.some((c: any) => c.images && c.images.length > maxImages)) {
    return {
      error: "Image limit reached",
      message: `Maximum number of images per chapter for ${userPlan} plan is ${maxImages}.`,
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
      replacedBook: limitResult.replacedBook,
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

  // Enforce chapter limit based on user's plan
  const userPlan = (user.plan as 'FREE' | 'CREATOR' | 'AUTHOR') || 'FREE';
  const maxChapters = LimitsService.getPlan(userPlan).chapter.maxChaptersPerBook;
  const maxImages = LimitsService.getPlan(userPlan).chapter.maxImagesPerChapter;

  if (validatedData.chapters && validatedData.chapters.length > maxChapters) {
    throw new Error(`Maximum number of chapters per book for ${userPlan} plan is ${maxChapters}.`);
  }

  // Enforce image limit based on user's plan
  if (validatedData.chapters && validatedData.chapters.some((c: any) => c.images && c.images.length > maxImages)) {
    throw new Error(`Maximum number of images per chapter for ${userPlan} plan is ${maxImages}.`);
  }

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
export async function getBookByIdService(bookId: string, userId?: string) {
  const book = await getBookById(bookId, userId);
  if (!book) {
    throw new Error("Book not found");
  }
  return book;
}
