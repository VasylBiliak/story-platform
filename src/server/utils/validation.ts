import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const bookCreateSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(1000),
  cover: z.string().min(1),
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
  ),
});
