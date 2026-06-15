import { DEFAULT_IMG } from "@/data/books";

/**
 * Returns a valid image URL with fallback to default image.
 * Handles null, undefined, empty strings, and whitespace-only strings.
 */
export function getChapterImage(image?: string | null): string {
  return image?.trim() ? image : DEFAULT_IMG;
}
