import { z } from "zod";

const chapterImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().optional(),
  caption: z
    .string()
    .max(200, "Caption must be less than 200 characters")
    .optional(),
  _delete: z.boolean().optional(),
  file: z.any().optional(),
});

const chapterSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(1, "Chapter title is required")
    .max(120, "Chapter title must be less than 120 characters"),

  content: z
    .string()
    .min(1, "Chapter content is required"),

  slug: z
    .string()
    .min(1, "Chapter slug is required")
    .max(160, "Chapter slug must be less than 160 characters"),

  isFree: z.boolean().optional(),

  price: z
    .number()
    .min(0, "Price must be non-negative")
    .optional(),

  discount: z
    .number()
    .int()
    .min(0)
    .max(100, "Discount must be between 0 and 100")
    .optional(),

  images: z.array(chapterImageSchema).optional(),
});

export const bookCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(120, "Title must be less than 120 characters"),

  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description must be less than 1000 characters"),

  cover: z.string().min(1, "Cover image URL is required"),

  price: z
    .number()
    .min(0, "Price must be non-negative")
    .optional(),

  chapters: z.array(chapterSchema).optional(),
});

export type BookCreateInput = z.infer<typeof bookCreateSchema>;
export type ChapterInput = z.infer<typeof chapterSchema>;
export type ChapterImageInput = z.infer<typeof chapterImageSchema>;