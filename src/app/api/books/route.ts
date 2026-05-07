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

export async function GET() {
  try {
    const books = await BookService.getBooks();
    return successResponse("Books retrieved successfully", books);
  } catch (error) {
    console.error("[API] GET books error:", error);
    return serverErrorResponse();
  }
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

    const parseResult = bookCreateSchema.safeParse(bookData);
    if (!parseResult.success) {
      console.error("[API] POST books error: Validation failed", parseResult.error.errors);
      return errorResponse(
        parseResult.error.errors[0]?.message ?? "Invalid input",
        400
      );
    }

    const chapters = parseResult.data.chapters || [];
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

    const book = await BookService.createBookWithChapters(
      parseResult.data,
      uploadedChapterImages,
      user.id,
      user.name || user.email
    );

    return successResponse("Book with chapters created successfully", book, 201);
  } catch (error) {
    console.error("[API] POST books error:", error);
    return serverErrorResponse();
  }
}
