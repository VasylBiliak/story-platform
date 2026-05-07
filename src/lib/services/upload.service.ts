import { uploadFile, uploadMultipleFiles, type UploadedFile } from "@/lib/upload";

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

  static validateFiles(files: File[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const file of files) {
      const validation = this.validateFile(file);
      if (!validation.valid && validation.error) {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static validateFile(file: File): { valid: boolean; error?: string } {
    const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`,
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File too large. Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    return { valid: true };
  }
}
