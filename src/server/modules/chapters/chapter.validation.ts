/**
 * Chapter payload validation
 */

import { z } from "zod";
import { ValidationError } from "@/server/core/errors/AppError";
import type { CreateChapterDto, UpdateChapterDto } from "./chapter.types";

const chapterImageSchema = z.object({
  url: z.string().url("Invalid image URL").min(1, "Image URL is required"),
  caption: z.string().max(200, "Caption must be less than 200 characters").optional(),
});

const createChapterSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Title must be less than 120 characters"),
  content: z.string().min(1, "Content is required").max(100000, "Content is too long"),
  slug: z.string().min(1, "Slug is required").max(160, "Slug must be less than 160 characters"),
  price: z.number().nonnegative("Price must be non-negative").optional(),
  discount: z.number().nonnegative("Discount must be non-negative").max(100, "Discount must be between 0 and 100").optional(),
  images: z.array(chapterImageSchema).optional(),
});

const updateChapterSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Title must be less than 120 characters").optional(),
  content: z.string().min(1, "Content is required").max(100000, "Content is too long").optional(),
  slug: z.string().min(1, "Slug is required").max(160, "Slug must be less than 160 characters").optional(),
  price: z.number().nonnegative("Price must be non-negative").optional(),
  discount: z.number().nonnegative("Discount must be non-negative").max(100, "Discount must be between 0 and 100").optional(),
  images: z.array(chapterImageSchema).optional(),
});

export function validateCreateChapterPayload(data: any): CreateChapterDto {
  const parseResult = createChapterSchema.safeParse(data);
  if (!parseResult.success) {
    throw new ValidationError(
      parseResult.error.errors[0]?.message ?? "Invalid input"
    );
  }
  return parseResult.data;
}

export function validateUpdateChapterPayload(data: any): UpdateChapterDto {
  const parseResult = updateChapterSchema.safeParse(data);
  if (!parseResult.success) {
    throw new ValidationError(
      parseResult.error.errors[0]?.message ?? "Invalid input"
    );
  }
  return parseResult.data;
}
