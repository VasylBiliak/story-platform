import { Book, Chapter } from "@/types";

/**
 * @deprecated Local storage is deprecated. Use API endpoints instead.
 */
export function getBooks(): Book[] {
  return [];
}

/**
 * @deprecated Local storage is deprecated. Use API endpoints instead.
 */
export function saveBooks(_books: Book[]): void {
  // Legacy local storage stub. Book persistence is handled by backend APIs.
}

/**
 * @deprecated Local storage is deprecated. Use API endpoints instead.
 */
export function getChapters(): Chapter[] {
  return [];
}

/**
 * @deprecated Local storage is deprecated. Use API endpoints instead.
 */
export function saveChapters(_chapters: Chapter[]): void {
  // Legacy local storage stub. Chapter persistence is handled by backend APIs.
}
