import { Book, Chapter, ChapterImage } from '@/lib/types';
import { books as mockBooks } from '@/data/books';
import { chapters as mockChapters } from '@/data/chapters';
import { STORAGE_KEYS } from './constants';

const BOOKS_KEY = STORAGE_KEYS.books;
const CHAPTERS_KEY = STORAGE_KEYS.chapters;

function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

// Migrate old string[] images to ChapterImage[] format
function migrateChapterImages(chapters: Chapter[]): Chapter[] {
  return chapters.map((chapter) => {
    if (!chapter.images) return chapter;
    
    // Check if images are old format (string array) or new format (ChapterImage[])
    const firstImage = chapter.images[0];
    if (typeof firstImage === 'string') {
      // Old format: string[] → new format: ChapterImage[]
      return {
        ...chapter,
        images: (chapter.images as unknown as string[]).map((url) => ({
          url,
          caption: '',
        })),
      };
    }
    return chapter;
  });
}

export function getBooks(): Book[] {
  if (typeof window === 'undefined') return [...mockBooks];
  const stored = localStorage.getItem(BOOKS_KEY);
  if (!stored) {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(mockBooks));
    return [...mockBooks];
  }
  return safeParse<Book[]>(stored, []);
}

export function saveBooks(books: Book[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

export function getChapters(): Chapter[] {
  if (typeof window === 'undefined') return [...mockChapters];
  const stored = localStorage.getItem(CHAPTERS_KEY);
  if (!stored) {
    localStorage.setItem(CHAPTERS_KEY, JSON.stringify(mockChapters));
    return [...mockChapters];
  }
  const chapters = safeParse<Chapter[]>(stored, []);
  return migrateChapterImages(chapters);
}

export function saveChapters(chapters: Chapter[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CHAPTERS_KEY, JSON.stringify(chapters));
}
