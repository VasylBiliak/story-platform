/**
 * Chapter service - orchestrates parsing, validation, permissions, and repository calls
 */

import { NotFoundError } from "@/server/core/errors/AppError";
import { parseChapterRequest } from "./chapter.parser";
import { validateCreateChapterPayload, validateUpdateChapterPayload } from "./chapter.validation";
import { ensureChapterOwner, ensureChapterExists } from "./chapter.permissions";
import { mapToCreateWithImages, mapToUpdateWithImages, mapUploadedFilesToImageDtos } from "./chapter.mapper";
import {
  createChapterRepository,
  updateChapterRepository,
  getChapterByIdRepository,
  getChapterBySlugRepository,
  getChaptersByBookIdRepository,
  deleteChapterRepository,
} from "./chapter.repository";
import { uploadMultipleFiles } from "@/lib/upload";
import type { CreateChapterDto, UpdateChapterDto, ChapterWithImages } from "./chapter.types";

/**
 * Create a new chapter with optional images
 */
export async function createChapterService(
  bookId: string,
  data: CreateChapterDto,
  uploadedImages?: File[]
): Promise<ChapterWithImages> {
  // Upload images if provided
  let imagesDto = data.images;
  if (uploadedImages && uploadedImages.length > 0) {
    const uploaded = await uploadMultipleFiles(uploadedImages);
    const captions = data.images?.map((img) => img.caption).filter((c): c is string => c !== undefined);
    imagesDto = mapUploadedFilesToImageDtos(uploaded, captions);
  }

  const createData = mapToCreateWithImages(
    { ...data, images: imagesDto },
    uploadedImages ? await uploadMultipleFiles(uploadedImages) : undefined
  );

  const chapter = await createChapterRepository(bookId, createData);
  return chapter;
}

/**
 * Update an existing chapter with optional images
 */
export async function updateChapterService(
  chapterId: string,
  data: UpdateChapterDto,
  uploadedImages?: File[]
): Promise<ChapterWithImages> {
  await ensureChapterExists(chapterId);

  // Upload images if provided
  let imagesDto = data.images;
  if (uploadedImages && uploadedImages.length > 0) {
    const uploaded = await uploadMultipleFiles(uploadedImages);
    const captions = data.images?.map((img) => img.caption).filter((c): c is string => c !== undefined);
    imagesDto = mapUploadedFilesToImageDtos(uploaded, captions);
  }

  const updateData = mapToUpdateWithImages(
    { ...data, images: imagesDto },
    uploadedImages ? await uploadMultipleFiles(uploadedImages) : undefined
  );

  const chapter = await updateChapterRepository(chapterId, updateData);
  return chapter;
}

/**
 * Get a chapter by ID
 */
export async function getChapterByIdService(chapterId: string): Promise<ChapterWithImages> {
  const chapter = await getChapterByIdRepository(chapterId);
  if (!chapter) {
    throw new NotFoundError("Chapter not found");
  }
  return chapter;
}

/**
 * Get a chapter by book ID and slug
 */
export async function getChapterBySlugService(
  bookId: string,
  slug: string
): Promise<ChapterWithImages> {
  const chapter = await getChapterBySlugRepository(bookId, slug);
  if (!chapter) {
    throw new NotFoundError("Chapter not found");
  }
  return chapter;
}

/**
 * Get all chapters for a book
 */
export async function getChaptersByBookIdService(bookId: string): Promise<ChapterWithImages[]> {
  return getChaptersByBookIdRepository(bookId);
}

/**
 * Delete a chapter (cascade deletes images automatically via Prisma)
 */
export async function deleteChapterService(chapterId: string): Promise<void> {
  await ensureChapterExists(chapterId);
  await deleteChapterRepository(chapterId);
}
