import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const bookCreateSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(1000),
  cover: z.string().min(1),
  price: z.number().nonnegative().optional(),
  images: z.array(z.string()).optional(),
  chapters: z.array(
    z.object({
      title: z.string().min(1).max(120),
      slug: z.string().min(1).max(160),
      content: z.string().min(1),
      isFree: z.boolean(),
      price: z.number().nonnegative().optional(),
      discount: z.number().int().min(0).max(999).optional(),
      finalPrice: z.number().nonnegative().optional(),
      images: z.array(
        z.object({
          url: z.string().min(1),
          caption: z.string().max(200),
        }),
      ).optional(),
    }),
  ).optional(),
});

export const chapterCreateSchema = z.object({
  title: z.string().min(1).max(120),
  content: z.string().min(1),
  slug: z.string().min(1).max(160),
  bookId: z.string().min(1),
  price: z.number().nonnegative().optional(),
  isFree: z.boolean().optional(),
});
