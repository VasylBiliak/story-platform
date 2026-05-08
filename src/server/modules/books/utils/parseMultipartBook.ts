/**
 * Parses multipart/form-data request for book operations
 */

import { ValidationError } from "@/server/core/errors/AppError";
import { extractChapterImages } from "./extractChapterImages";

export interface ParseMultipartBookResult {
  body: any;
  uploadedChapterImages: File[][];
}

export function parseMultipartBook(
  formData: FormData
): ParseMultipartBookResult {
  const rawBook = formData.get("book");
  if (!rawBook || typeof rawBook !== "string") {
    throw new ValidationError("Invalid book payload format");
  }

  let body: any;
  try {
    body = JSON.parse(rawBook);
  } catch (error) {
    console.error("[BOOK_PARSE_ERROR]", error);
    throw new ValidationError("Invalid JSON payload");
  }

  const chapters = body.chapters || [];
  const uploadedChapterImages = extractChapterImages(formData, chapters);

  console.log(
    "[BOOK_CONTROLLER] Extracted uploaded images:",
    uploadedChapterImages.map((imgs) => imgs.length)
  );

  return { body, uploadedChapterImages };
}
