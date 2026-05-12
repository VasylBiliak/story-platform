/**
 * Request parser for chapter operations
 */

import { NextRequest } from "next/server";
import { ValidationError } from "@/server/core/errors/AppError";

export interface ParseChapterRequestResult {
  body: any;
  uploadedImages?: File[][];
}

export async function parseChapterRequest(
  req: NextRequest
): Promise<ParseChapterRequestResult> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    return parseMultipartChapter(formData);
  } else if (contentType.includes("application/json")) {
    const body = await req.json();
    return { body, uploadedImages: undefined };
  } else {
    throw new ValidationError(
      "Unsupported content-type. Use application/json or multipart/form-data"
    );
  }
}

function parseMultipartChapter(formData: FormData): ParseChapterRequestResult {
  const rawBook = formData.get("book");
  
  if (!rawBook || typeof rawBook !== "string") {
    throw new ValidationError("Invalid book payload format");
  }

  let body;
  try {
    body = JSON.parse(rawBook);
  } catch {
    throw new ValidationError("Invalid JSON payload");
  }

  const chapterImages = parseChapterImages(formData);

  return { body, uploadedImages: chapterImages };
}

function parseChapterImages(formData: FormData): File[][] {
  const chapterImages: File[][] = [];
  const chapterMap = new Map<number, File[]>();

  // Pattern: chapterImages_{chapterIndex}_{imageIndex}
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("chapterImages_") && value instanceof File) {
      const match = key.match(/chapterImages_(\d+)_(\d+)/);
      if (match) {
        const chapterIndex = parseInt(match[1], 10);
        const imageIndex = parseInt(match[2], 10);

        if (!chapterMap.has(chapterIndex)) {
          chapterMap.set(chapterIndex, []);
        }
        const images = chapterMap.get(chapterIndex)!;
        images[imageIndex] = value;
      }
    }
  }

  const maxChapterIndex = Math.max(0, ...chapterMap.keys());
  for (let i = 0; i <= maxChapterIndex; i++) {
    chapterImages.push(chapterMap.get(i) || []);
  }

  return chapterImages;
}
