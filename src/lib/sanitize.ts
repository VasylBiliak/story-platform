/**
 * Input sanitization utilities
 * Removes HTML tags and dangerous characters to prevent XSS
 */

export const INPUT_LIMITS = {
  bookTitle: 100,
  author: 60,
  description: 500,
  chapterTitle: 120,
  chapterContent: 5000,
  caption: 200,
} as const;

export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
] as const;

export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * Sanitize text input by removing HTML tags and dangerous characters
 */
export function sanitizeText(value: string): string {
  return value
    .replace(/<[^>]*>?/gm, "") // Remove HTML tags
    .replace(/[<>]/g, "") // Extra safety for any remaining brackets
    .trim();
}

/**
 * Validate that a string doesn't exceed the maximum length
 */
export function validateLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

/**
 * Validate image file type
 */
export function isValidImageType(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number]);
}

/**
 * Validate image file size
 */
export function isValidImageSize(file: File): boolean {
  return file.size <= MAX_IMAGE_SIZE;
}

/**
 * Validate image file (type and size)
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  if (!isValidImageType(file)) {
    return { valid: false, error: `Invalid file type. Allowed: PNG, JPEG, WebP` };
  }
  if (!isValidImageSize(file)) {
    return { valid: false, error: `File too large. Maximum size: 2MB` };
  }
  return { valid: true };
}

/**
 * Truncate text to maximum length with ellipsis
 */
export function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength - 3) + "...";
}