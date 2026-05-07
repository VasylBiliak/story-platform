import { z } from "zod";

export const bookCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Title must be less than 120 characters"),
  description: z.string().min(1, "Description is required").max(1000, "Description must be less than 1000 characters"),
  cover: z.string().min(1, "Cover image URL is required"),
  price: z.number().nonnegative("Price must be non-negative").optional(),
});

export type BookCreateInput = z.infer<typeof bookCreateSchema>;
