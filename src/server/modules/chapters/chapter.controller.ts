/**
 * Chapter controller - thin layer for HTTP request/response handling
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/server/utils/api";
import { AppError } from "@/server/core/errors/AppError";
import {
  createChapterService,
  updateChapterService,
  getChapterByIdService,
  getChapterBySlugService,
  getChaptersByBookIdService,
  deleteChapterService,
} from "./chapter.service";
import { validateCreateChapterPayload, validateUpdateChapterPayload } from "./chapter.validation";
import { ensureChapterOwner } from "./chapter.permissions";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function getChapterByIdHandler(chapterId: string) {
  try {
    const chapter = await getChapterByIdService(chapterId);
    return successResponse(chapter);
  } catch (error) {
    console.error("[ChapterController] getChapterById error:", error);
    return handleControllerError(error);
  }
}

export async function getChapterBySlugHandler(bookId: string, slug: string) {
  try {
    const chapter = await getChapterBySlugService(bookId, slug);
    return successResponse(chapter);
  } catch (error) {
    console.error("[ChapterController] getChapterBySlug error:", error);
    return handleControllerError(error);
  }
}

export async function getChaptersByBookIdHandler(bookId: string) {
  try {
    const chapters = await getChaptersByBookIdService(bookId);
    return successResponse(chapters);
  } catch (error) {
    console.error("[ChapterController] getChaptersByBookId error:", error);
    return handleControllerError(error);
  }
}

export async function createChapterHandler(req: NextRequest, bookId: string) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json();
    const validatedData = validateCreateChapterPayload(body);

    const chapter = await createChapterService(bookId, validatedData);
    return successResponse(chapter);
  } catch (error) {
    console.error("[ChapterController] createChapter error:", error);
    return handleControllerError(error);
  }
}

export async function updateChapterHandler(req: NextRequest, chapterId: string) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    await ensureChapterOwner(chapterId, user.id);

    const body = await req.json();
    const validatedData = validateUpdateChapterPayload(body);

    const chapter = await updateChapterService(chapterId, validatedData);
    return successResponse(chapter);
  } catch (error) {
    console.error("[ChapterController] updateChapter error:", error);
    return handleControllerError(error);
  }
}

export async function deleteChapterHandler(req: NextRequest, chapterId: string) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    await ensureChapterOwner(chapterId, user.id);
    await deleteChapterService(chapterId);

    return successResponse({ message: "Chapter deleted" });
  } catch (error) {
    console.error("[ChapterController] deleteChapter error:", error);
    return handleControllerError(error);
  }
}

function handleControllerError(error: unknown) {
  if (error instanceof AppError) {
    return errorResponse(error.message, error.statusCode);
  }
  return errorResponse(
    error instanceof Error ? error.message : "Internal Server Error",
    500
  );
}
