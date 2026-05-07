import { NextRequest } from "next/server";
import { successResponse, errorResponse, notFoundResponse, unauthorizedResponse } from "@/server/utils/api";
import { getUserFromRequest } from "@/server/middlewares/authMiddleware";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { createBook, deleteBook, getBookById, getBooks, updateBook } from "@/server/services/bookService";
import { getChapters } from "@/server/services/chapterService";
import { bookCreateSchema } from "@/server/utils/validation";

export async function listBooksHandler() {
  console.log("[BookController] listBooksHandler");
  const books = await getBooks();
  return successResponse(books);
}

export async function getBookByIdHandler(bookId: string) {
  console.log("[BookController] getBookByIdHandler:", bookId);
  const book = await getBookById(bookId);
  if (!book) {
    return notFoundResponse("Book not found");
  }
  return successResponse(book);
}

export async function getChaptersHandler(req: NextRequest) {
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
}

// bookController.ts

export async function createBookHandler(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return unauthorizedResponse();

    const body = await req.json();

    const parseResult = bookCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse(
        parseResult.error.errors[0]?.message ?? "Invalid input",
        422
      );
    }

    const book = await createBook(user.id, {
      ...parseResult.data,
      author: user.name || user.email,
    });

    return successResponse(book);
  } catch (error) {
    console.error("CREATE BOOK ERROR:", error);

    return errorResponse("Internal Server Error", 500);
  }
}

/*export async function createBookHandler(req: NextRequest) {
   const user = await getUserFromRequest(req);
  if (!user) {
    return unauthorizedResponse();
  }

  const body = await req.json();
  const parseResult = bookCreateSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.errors[0]?.message ?? "Invalid input", 422);
  }

  try {
    const book = await createBook(user.userId, {
      title: parseResult.data.title,
      description: parseResult.data.description,
      cover: parseResult.data.cover,
      author: user.email,
      chapters: parseResult.data.chapters,
    });
    console.log("[BookController] Book created:", book.id);
    return successResponse(book);
  } catch (error) {
    console.error("[BookController] createBook error:", error);
    return errorResponse(error instanceof Error ? error.message : "Failed to create book", 500);
  }
} */

export async function updateBookHandler(req: NextRequest, bookId: string) {
  const user = await getCurrentUser(req);
  if (!user) {
    return unauthorizedResponse();
  }

  const body = await req.json();
  const parseResult = bookCreateSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.errors[0]?.message ?? "Invalid input", 422);
  }

  try {
    const existingBook = await getBookById(bookId);
    if (!existingBook) {
      return notFoundResponse("Book not found");
    }
    if (existingBook.ownerId !== user.id) {
      return unauthorizedResponse();
    }

    const updatedBook = await updateBook(bookId, {
      title: parseResult.data.title,
      description: parseResult.data.description,
      cover: parseResult.data.cover,
      price: parseResult.data.price,
      chapters: parseResult.data.chapters,
    });
    console.log("[BookController] Book updated:", updatedBook.id);
    return successResponse(updatedBook);
  } catch (error) {
    console.error("[BookController] updateBook error:", error);
    return errorResponse(error instanceof Error ? error.message : "Failed to update book", 500);
  }
}

export async function deleteBookHandler(req: NextRequest, bookId: string) {
  const user = await getCurrentUser(req);
  if (!user) {
    return unauthorizedResponse();
  }

  const existingBook = await getBookById(bookId);
  if (!existingBook) {
    return notFoundResponse("Book not found");
  }
  if (existingBook.ownerId !== user.id) {
    return unauthorizedResponse();
  }

  try {
    await deleteBook(bookId);
    console.log("[BookController] Book deleted:", bookId);
    return successResponse({ message: "Book deleted" });
  } catch (error) {
    console.error("[BookController] deleteBook error:", error);
    return errorResponse(error instanceof Error ? error.message : "Failed to delete book", 500);
  }
}
