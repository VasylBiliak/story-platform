import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { BookService } from "@/lib/services/book.service";
import { UploadService } from "@/lib/services/upload.service";
import { bookCreateSchema } from "@/lib/validators/book";
import { parseChapterImages, validateFormData } from "@/lib/utils/multipart";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api-response";
import { listBooksHandler } from "@/server/modules/books/book.controller";
import { handleBookLimit } from "@/server/modules/limits/limits.guard";

export async function GET(req: NextRequest) {
  return listBooksHandler(req);
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return unauthorizedResponse();
    }

    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("multipart/form-data")) {
      console.error("[API] POST books error: Invalid content-type", contentType);
      return errorResponse("Content-Type must be multipart/form-data", 400);
    }

    const formData = await req.formData();

    const validation = validateFormData(formData);
    if (!validation.valid) {
      console.error("[API] POST books error:", validation.error);
      return errorResponse(validation.error || "Invalid form data", 400);
    }

    const bookJson = formData.get("book") as string;
    let bookData;

    try {
      bookData = JSON.parse(bookJson);
    } catch (error) {
      console.error("[API] POST books error: Failed to parse book JSON", error);
      return errorResponse("Invalid JSON structure in book data", 400);
    }

    console.log("[BOOK_PAYLOAD_BEFORE_VALIDATION]", JSON.stringify(bookData, null, 2));

    const parseResult = bookCreateSchema.safeParse(bookData);
    if (!parseResult.success) {
      console.error("[API] POST books error: Validation failed", parseResult.error.errors);
      return errorResponse(
        parseResult.error.errors[0]?.message ?? "Invalid input",
        400
      );
    }

    // Enforce chapter limit (max 5)
    const chapters = parseResult.data.chapters || [];
    if (chapters.length > 5) {
      return errorResponse("Maximum number of chapters per book is 5.", 400);
    }

    // Enforce image limit (max 3 per chapter)
    if (chapters.some((c: any) => c.images && c.images.length > 3)) {
      return errorResponse("Maximum number of images per chapter is 3.", 400);
    }

    const hasChapters = chapters.length > 0;

    let uploadedChapterImages: any[] = [];

    if (hasChapters) {
      const chapterImages = parseChapterImages(formData);

      if (chapterImages.some((imgs) => imgs.length > 0)) {
        const validation = UploadService.validateChapterImages(chapterImages);
        if (!validation.valid) {
          console.error("[API] POST books error: Image validation failed", validation.errors);
          return errorResponse(validation.errors.join(", "), 400);
        }

        uploadedChapterImages = await UploadService.uploadChapterImages(chapterImages);
      }
    }

    // Enforce book limit: delete oldest if needed
    const limitResult = await handleBookLimit(user.id);

    const book = await BookService.createBookWithChapters(
      parseResult.data,
      uploadedChapterImages,
      user.id,
      user.name || user.email
    );

    // Return response with limit info if book was replaced
    if (limitResult?.removedBookId) {
      return new Response(
        JSON.stringify({
          message: "Book limit reached. Your oldest book was replaced because this is a demo environment.",
          maxBooks: 3,
          replacedBookId: limitResult.removedBookId,
          createdBook: book,
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Standard response for new books created without hitting limit
    return new Response(
      JSON.stringify({
        message: "Book created successfully.",
        maxBooks: 3,
        createdBook: book,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("[API] POST books error:", error);
    return serverErrorResponse();
  }
}
