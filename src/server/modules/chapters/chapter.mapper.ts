/**
 * Maps validated data to repository layer format
 */

import type { CreateChapterDto, UpdateChapterDto } from "./chapter.types";
import type { UploadedFile } from "@/types";

export interface CreateChapterWithImagesDto extends CreateChapterDto {
  uploadedImages?: UploadedFile[];
}

export interface UpdateChapterWithImagesDto extends UpdateChapterDto {
  uploadedImages?: UploadedFile[];
}

/**
 * Transform validated data with uploaded images for create operation
 */
export function mapToCreateWithImages(
  data: CreateChapterDto,
  uploadedImages?: UploadedFile[]
): CreateChapterWithImagesDto {
  return {
    ...data,
    uploadedImages,
  };
}

/**
 * Transform validated data with uploaded images for update operation
 */
export function mapToUpdateWithImages(
  data: UpdateChapterDto,
  uploadedImages?: UploadedFile[]
): UpdateChapterWithImagesDto {
  return {
    ...data,
    uploadedImages,
  };
}

/**
 * Transform uploaded files to image DTOs
 */
export function mapUploadedFilesToImageDtos(
  uploadedImages: UploadedFile[],
  captions?: string[]
): CreateChapterDto["images"] {
  return uploadedImages.map((file, index) => ({
    url: file.url,
    caption: captions?.[index],
  }));
}
