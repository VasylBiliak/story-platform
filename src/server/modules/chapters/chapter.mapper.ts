/**
 * Maps validated data to repository layer format
 */

import type { CreateChapterDto, UpdateChapterDto } from "./chapter.types";
import type { UploadedFile } from "@/types";

/**
 * Transform uploaded files to image DTOs
 */
export function mapUploadedFilesToImageDtos(
  uploadedImages: UploadedFile[],
  captions?: string[]
): CreateChapterDto["images"] {
  console.log("[MAP_UPLOADED_FILES_TO_IMAGE_DTOS] Input:", { uploadedImagesCount: uploadedImages.length, captionsCount: captions?.length });
  const result = uploadedImages.map((file, index) => ({
    url: file.url,
    caption: captions?.[index],
  }));
  console.log("[MAP_UPLOADED_FILES_TO_IMAGE_DTOS] Output:", result);
  return result;
}
