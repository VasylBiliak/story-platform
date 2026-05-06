import { Book, Chapter } from '@/lib/types';

export function getBooks(): Book[] {
  // Mock storage is deprecated. Frontend should use API endpoints.
  return [];
}

export function saveBooks(_books: Book[]): void {
  // Legacy local storage stub. Book persistence is handled by backend APIs.
}

export function getChapters(): Chapter[] {
  // Mock storage is deprecated. Frontend should use API endpoints.
  return [];
}

export function saveChapters(_chapters: Chapter[]): void {
  // Legacy local storage stub. Chapter persistence is handled by backend APIs.
}
