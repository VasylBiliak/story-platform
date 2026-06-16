import { z } from "zod";
import { AUTH_LIMITS } from "@/lib/constants/auth";

export const registerSchema = z.object({
  email: z.string()
    .email("Invalid email format")
    .max(AUTH_LIMITS.EMAIL_MAX_LENGTH, `Email cannot exceed ${AUTH_LIMITS.EMAIL_MAX_LENGTH} characters`)
    .trim(),
  password: z.string()
    .min(AUTH_LIMITS.PASSWORD_MIN_LENGTH, `Password must be at least ${AUTH_LIMITS.PASSWORD_MIN_LENGTH} characters`)
    .max(AUTH_LIMITS.PASSWORD_MAX_LENGTH, `Password cannot exceed ${AUTH_LIMITS.PASSWORD_MAX_LENGTH} characters`)
    .trim(),
  name: z.string()
    .min(1, "Pseudonym is required")
    .max(AUTH_LIMITS.PSEUDONYM_MAX_LENGTH, `Pseudonym cannot exceed ${AUTH_LIMITS.PSEUDONYM_MAX_LENGTH} characters`)
    .trim(),
});

export const loginSchema = z.object({
  email: z.string()
    .email("Invalid email format")
    .max(AUTH_LIMITS.EMAIL_MAX_LENGTH, `Email cannot exceed ${AUTH_LIMITS.EMAIL_MAX_LENGTH} characters`)
    .trim(),
  password: z.string()
    .min(1, "Password is required")
    .max(AUTH_LIMITS.PASSWORD_MAX_LENGTH, `Password cannot exceed ${AUTH_LIMITS.PASSWORD_MAX_LENGTH} characters`)
    .trim(),
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
      isFree: z.boolean().optional(),
      price: z.number().nonnegative().optional(),
      discount: z.number().int().min(0).max(100).optional(),
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
  discount: z.number().int().min(0).max(100).optional(),
});
