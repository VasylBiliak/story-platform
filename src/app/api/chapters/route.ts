import { NextRequest } from "next/server";
import { getChaptersHandler } from "@/server/controllers/bookController";
import { successResponse, errorResponse, notFoundResponse, unauthorizedResponse } from "@/server/utils/api";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { createChapter } from "@/server/services/chapterService";
import { getBookById } from "@/server/services/bookService";
import { chapterCreateSchema } from "@/server/utils/validation";

export async function GET(req: NextRequest) {
  return getChaptersHandler(req);
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return unauthorizedResponse();

    const body = await req.json();

    const parseResult = chapterCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse(
        parseResult.error.errors[0]?.message ?? "Invalid input",
        422
      );
    }

    const book = await getBookById(parseResult.data.bookId);
    if (!book) {
      return notFoundResponse("Book not found");
    }

    if (book.ownerId !== user.id) {
      return errorResponse("Forbidden", 403);
    }

    const chapter = await createChapter(parseResult.data.bookId, {
      title: parseResult.data.title,
      content: parseResult.data.content,
      slug: parseResult.data.slug,
      price: parseResult.data.price,
      isFree: parseResult.data.isFree,
    });

    return successResponse(chapter);
  } catch (error) {
    console.error("CREATE CHAPTER ERROR:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
