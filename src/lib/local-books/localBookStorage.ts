/**
 * Local book storage utilities
 * Handles localStorage operations for local books with SSR-safe access
 */

import { LocalBook, LocalChapter, LocalBookStorage } from './localBook.types';

const STORAGE_KEY = 'local_books';

/**
 * SSR-safe check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely parse JSON from localStorage
 */
function safeParseJSON<T>(value: string | null, defaultValue: T): T {
  if (!value) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Get all local books and chapters from localStorage
 */
export function getLocalBooks(): LocalBookStorage {
  if (!isLocalStorageAvailable()) {
    return { books: [], chapters: [] };
  }

  const data = localStorage.getItem(STORAGE_KEY);
  return safeParseJSON<LocalBookStorage>(data, { books: [], chapters: [] });
}

/**
 * Save local books and chapters to localStorage
 */
function saveLocalBooksStorage(storage: LocalBookStorage): void {
  if (!isLocalStorageAvailable()) return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error('Failed to save local books to localStorage:', error);
  }
}

/**
 * Get a local book by ID
 */
export function getLocalBookById(bookId: string): LocalBook | null {
  const storage = getLocalBooks();
  return storage.books.find(book => book.localBookId === bookId) || null;
}

/**
 * Get chapters for a local book
 */
export function getLocalChaptersByBookId(bookId: string): LocalChapter[] {
  const storage = getLocalBooks();
  return storage.chapters.filter(chapter => chapter.bookId === bookId);
}

/**
 * Save a new local book
 */
export function saveLocalBook(book: LocalBook, chapters: LocalChapter[]): void {
  const storage = getLocalBooks();
  
  // Check if book already exists
  const existingIndex = storage.books.findIndex(b => b.localBookId === book.localBookId);
  
  if (existingIndex >= 0) {
    // Update existing book
    storage.books[existingIndex] = book;
    // Remove old chapters for this book
    storage.chapters = storage.chapters.filter(c => c.bookId !== book.localBookId);
  } else {
    // Add new book
    storage.books.push(book);
  }
  
  // Add chapters
  storage.chapters.push(...chapters);
  
  saveLocalBooksStorage(storage);
}

/**
 * Update an existing local book
 */
export function updateLocalBook(book: LocalBook, chapters?: LocalChapter[]): void {
  const storage = getLocalBooks();
  
  // Update book
  const bookIndex = storage.books.findIndex(b => b.localBookId === book.localBookId);
  if (bookIndex >= 0) {
    storage.books[bookIndex] = { ...book, updatedAt: new Date().toISOString() };
  }
  
  // Update chapters if provided
  if (chapters) {
    storage.chapters = storage.chapters.filter(c => c.bookId !== book.localBookId);
    storage.chapters.push(...chapters);
  }
  
  saveLocalBooksStorage(storage);
}

/**
 * Delete a local book and its chapters
 */
export function deleteLocalBook(bookId: string): void {
  const storage = getLocalBooks();
  
  storage.books = storage.books.filter(book => book.localBookId !== bookId);
  storage.chapters = storage.chapters.filter(chapter => chapter.bookId !== bookId);
  
  saveLocalBooksStorage(storage);
}

/**
 * Clear all local books (useful for testing)
 */
export function clearAllLocalBooks(): void {
  if (!isLocalStorageAvailable()) return;
  localStorage.removeItem(STORAGE_KEY);
}
