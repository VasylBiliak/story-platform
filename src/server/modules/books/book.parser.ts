/**
 * Request parser for book operations
 */

import { NextRequest } from "next/server";
import { ValidationError } from "@/server/core/errors/AppError";
import { parseMultipartBook } from "./utils/parseMultipartBook";

export interface ParseBookRequestResult {
  body: any;
  uploadedChapterImages?: File[][];
}

export async function parseBookRequest(
  req: NextRequest
): Promise<ParseBookRequestResult> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    return parseMultipartBook(formData);
  } else if (contentType.includes("application/json")) {
    const body = await req.json();
    return { body, uploadedChapterImages: undefined };
  } else {
    throw new ValidationError(
      "Unsupported content-type. Use application/json or multipart/form-data"
    );
  }
}
