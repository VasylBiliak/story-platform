/**
 * Book controller - thin layer for HTTP request/response handling
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/server/utils/api";
import { AppError } from "@/server/core/errors/AppError";
import {
  listBooksService,
  getBookByIdService,
  createBookService,
  updateBookService,
  deleteBookService,
} from "./book.service";
import { getChapters } from "@/server/services/chapterService";

export async function listBooksHandler() {
  try {
    const books = await listBooksService();
    return successResponse(books);
  } catch (error) {
    console.error("[BookController] listBooks error:", error);
    return handleControllerError(error);
  }
}

export async function getBookByIdHandler(bookId: string) {
  try {
    const book = await getBookByIdService(bookId);
    return successResponse(book);
  } catch (error) {
    console.error("[BookController] getBookById error:", error);
    return handleControllerError(error);
  }
}

export async function getChaptersHandler(req: NextRequest) {
  try {
    const bookId = req.nextUrl.searchParams.get("bookId");
    const slug = req.nextUrl.searchParams.get("slug");
    const chapterId = req.nextUrl.searchParams.get("chapterId");

    if (chapterId) {
      const chapters = await getChapters(bookId ?? undefined, undefined);
      const matching = chapters.filter((chapter) => chapter.id === chapterId);
      return successResponse(matching);
    }

    const chapters = await getChapters(bookId ?? undefined, slug ?? undefined);
    return successResponse(chapters);
  } catch (error) {
    console.error("[BookController] getChapters error:", error);
    return handleControllerError(error);
  }
}

export async function createBookHandler(req: NextRequest) {
  try {
    const book = await createBookService(req);
    return successResponse(book);
  } catch (error) {
    console.error("[BookController] createBook error:", error);
    return handleControllerError(error);
  }
}

export async function updateBookHandler(req: NextRequest, bookId: string) {
  try {
    const book = await updateBookService(req, bookId);
    return successResponse(book);
  } catch (error) {
    console.error("[BookController] updateBook error:", error);
    return handleControllerError(error);
  }
}

export async function deleteBookHandler(req: NextRequest, bookId: string) {
  try {
    const result = await deleteBookService(req, bookId);
    return successResponse(result);
  } catch (error) {
    console.error("[BookController] deleteBook error:", error);
    return handleControllerError(error);
  }
}

/**
 * Converts application errors to HTTP responses
 */
function handleControllerError(error: unknown) {
  if (error instanceof AppError) {
    return errorResponse(error.message, error.statusCode);
  }
  return errorResponse(
    error instanceof Error ? error.message : "Internal Server Error",
    500
  );
}
