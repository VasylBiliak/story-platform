/**
 * Local book mapper utilities
 * Converts between form data and local book storage format
 */

import { LocalBook, LocalChapter, LocalBookInput, LocalChapterInput } from './localBook.types';
import { ChapterImage } from '@/types';

/**
 * Generate a stable ID for local books
 */
export function generateLocalBookId(): string {
  return `local_${crypto.randomUUID()}`;
}

/**
 * Generate a stable ID for local chapters
 */
export function generateLocalChapterId(): string {
  return `local_chapter_${crypto.randomUUID()}`;
}

/**
 * Convert form data to local book format
 */
export function mapFormToLocalBook(
  bookData: {
    title: string;
    description: string;
    cover: string;
    author: string;
  },
  chaptersData: Array<{
    title: string;
    slug: string;
    content: string;
    isFree: boolean;
    price?: number;
    discount?: number;
    images?: ChapterImage[];
  }>
): { book: LocalBook; chapters: LocalChapter[] } {
  const localBookId = generateLocalBookId();
  const now = new Date().toISOString();

  const book: LocalBook = {
    id: localBookId, // Use localBookId as the main id for routing
    localBookId,
    title: bookData.title,
    description: bookData.description,
    cover: bookData.cover,
    author: bookData.author,
    isLocal: true,
    createdLocallyAt: now,
    updatedAt: now,
  };

  const chapters: LocalChapter[] = chaptersData.map((chapter, index) => ({
    id: generateLocalChapterId(),
    localChapterId: generateLocalChapterId(),
    bookId: localBookId,
    title: chapter.title,
    slug: chapter.slug || `chapter-${index + 1}`,
    content: chapter.content,
    isFree: chapter.isFree,
    price: chapter.isFree ? 0 : (chapter.price ?? 0),
    discount: chapter.isFree ? 0 : (chapter.discount ?? 0),
    images: chapter.images || [],
    isLocal: true,
  }));

  return { book, chapters };
}

/**
 * Update local book from form data
 */
export function updateLocalBookFromForm(
  existingBook: LocalBook,
  bookData: {
    title: string;
    description: string;
    cover: string;
    author: string;
  },
  chaptersData: Array<{
    id?: string;
    title: string;
    slug: string;
    content: string;
    isFree: boolean;
    price?: number;
    discount?: number;
    images?: ChapterImage[];
  }>
): { book: LocalBook; chapters: LocalChapter[] } {
  const now = new Date().toISOString();

  const book: LocalBook = {
    ...existingBook,
    title: bookData.title,
    description: bookData.description,
    cover: bookData.cover,
    author: bookData.author,
    updatedAt: now,
  };

  const chapters: LocalChapter[] = chaptersData.map((chapter, index) => ({
    id: chapter.id || generateLocalChapterId(),
    localChapterId: chapter.id || generateLocalChapterId(),
    bookId: existingBook.localBookId,
    title: chapter.title,
    slug: chapter.slug || `chapter-${index + 1}`,
    content: chapter.content,
    isFree: chapter.isFree,
    price: chapter.isFree ? 0 : (chapter.price ?? 0),
    discount: chapter.isFree ? 0 : (chapter.discount ?? 0),
    images: chapter.images || [],
    isLocal: true,
  }));

  return { book, chapters };
}

/**
 * Convert local book to display format (merges with Book type)
 */
export function localBookToDisplay(localBook: LocalBook): LocalBook {
  return localBook;
}

/**
 * Convert local chapter to display format
 */
export function localChapterToDisplay(localChapter: LocalChapter): LocalChapter {
  return localChapter;
}
