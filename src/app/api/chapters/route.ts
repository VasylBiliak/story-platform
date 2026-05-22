import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { ChapterService } from "@/lib/services/chapter.service";
import { UploadService } from "@/lib/services/upload.service";
import { chapterCreateSchema } from "@/lib/validators/chapter";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api-response";
import { handleChapterLimit, handleChapterImageLimit } from "@/server/modules/limits/limits.guard";
import { LimitsService } from "@/server/modules/limits/limits.service";

export async function GET(req: NextRequest) {
  try {
    const bookId = req.nextUrl.searchParams.get("bookId");

    if (!bookId) {
      return errorResponse("Book ID is required", 400);
    }

    const chapters = await ChapterService.getChaptersByBookId(bookId);
    return successResponse("Chapters retrieved successfully", chapters);
  } catch (error) {
    console.error("[API] GET chapters error:", error);
    return serverErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return unauthorizedResponse();
    }

    const formData = await req.formData();

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const slug = formData.get("slug") as string;
    const bookId = formData.get("bookId") as string;
    const price = formData.get("price") as string | null;
    const isFree = formData.get("isFree") as string | null;

    const images = formData.getAll("images") as File[];

    const parseResult = chapterCreateSchema.safeParse({
      title,
      content,
      slug,
      bookId,
      price: price ? parseFloat(price) : undefined,
      isFree: isFree ? isFree === "true" : undefined,
    });

    if (!parseResult.success) {
      return errorResponse(
        parseResult.error.errors[0]?.message ?? "Invalid input",
        400
      );
    }

    const slugUnique = await ChapterService.verifySlugUnique(
      parseResult.data.bookId,
      parseResult.data.slug
    );

    if (!slugUnique) {
      return errorResponse("Slug must be unique within the book", 400);
    }

    // Enforce chapter limit
    const chapterCount = await LimitsService.countChaptersByBook(parseResult.data.bookId);
    if (chapterCount >= 5) {
      return errorResponse(
        "Maximum number of chapters per book is 5.",
        400
      );
    }

    let uploadedImages: any[] = [];

    if (images && images.length > 0) {
      // Enforce image limit
      if (images.length > 3) {
        return errorResponse(
          "Maximum number of images per chapter is 3.",
          400
        );
      }

      const validation = UploadService.validateFiles(images);
      if (!validation.valid) {
        return errorResponse(validation.errors.join(", "), 400);
      }

      uploadedImages = await UploadService.uploadMultiple(images);
    }

    const chapter = await ChapterService.createChapter(
      parseResult.data,
      uploadedImages,
      user.id
    );

    return successResponse("Chapter created successfully", chapter, 201);
  } catch (error) {
    console.error("[API] POST chapters error:", error);

    if (error instanceof Error) {
      if (error.message === "Forbidden") {
        return forbiddenResponse();
      }
      if (error.message === "Book not found") {
        return notFoundResponse("Book not found");
      }
    }

    return serverErrorResponse();
  }
}
