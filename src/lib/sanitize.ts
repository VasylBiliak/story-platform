/**
 * Input sanitization utilities
 * Removes HTML tags and dangerous characters to prevent XSS
 */

import { INPUT_LIMITS, IMAGE_CONSTRAINTS } from "./constants";

// Re-export for backward compatibility
export { INPUT_LIMITS };
export const ALLOWED_IMAGE_TYPES = IMAGE_CONSTRAINTS.allowedTypes;
export const MAX_IMAGE_SIZE = IMAGE_CONSTRAINTS.maxSize;

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
  return IMAGE_CONSTRAINTS.allowedTypes.includes(file.type as typeof IMAGE_CONSTRAINTS.allowedTypes[number]);
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
  if (!IMAGE_CONSTRAINTS.allowedTypes.includes(file.type as typeof IMAGE_CONSTRAINTS.allowedTypes[number])) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${IMAGE_CONSTRAINTS.allowedTypes.map(t => t.replace("image/", "").toUpperCase()).join(", ")}`,
    };
  }
  if (file.size > IMAGE_CONSTRAINTS.maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${IMAGE_CONSTRAINTS.maxSizeDisplay}`,
    };
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