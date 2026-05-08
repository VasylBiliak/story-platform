import { uploadFile, uploadMultipleFiles, validateFile } from "@/lib/upload";
import type { UploadedFile } from "@/types";

export class UploadService {
  static async uploadSingle(file: File): Promise<UploadedFile> {
    try {
      return await uploadFile(file);
    } catch (error) {
      console.error("[UploadService] Single upload error:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to upload file");
    }
  }

  static async uploadMultiple(files: File[]): Promise<UploadedFile[]> {
    try {
      return await uploadMultipleFiles(files);
    } catch (error) {
      console.error("[UploadService] Multiple upload error:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to upload files");
    }
  }

  static async uploadChapterImages(
    chapterImages: File[][]
  ): Promise<UploadedFile[][]> {
    try {
      const uploadPromises = chapterImages.map((images) =>
        this.uploadMultiple(images)
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("[UploadService] Chapter images upload error:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to upload chapter images");
    }
  }

  static validateFiles(files: File[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid && validation.error) {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static validateChapterImages(
    chapterImages: File[][]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    chapterImages.forEach((images, chapterIndex) => {
      images.forEach((file, imageIndex) => {
        const validation = validateFile(file);
        if (!validation.valid && validation.error) {
          errors.push(`Chapter ${chapterIndex + 1}, Image ${imageIndex + 1}: ${validation.error}`);
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
