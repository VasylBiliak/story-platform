import { z } from "zod";

export const chapterCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Title must be less than 120 characters"),
  content: z.string().min(1, "Content is required"),
  slug: z.string().min(1, "Slug is required").max(160, "Slug must be less than 160 characters"),
  bookId: z.string().min(1, "Book ID is required"),
  price: z.number().nonnegative("Price must be non-negative").optional(),
  isFree: z.boolean().optional(),
});

export type ChapterCreateInput = z.infer<typeof chapterCreateSchema>;
