/**
 * React hook for managing local books
 * Provides functions to create, update, delete, and query local books
 */

import { useState, useEffect } from 'react';
import { LocalBook, LocalChapter } from '../localBook.types';
import {
  getLocalBooks,
  getLocalBookById,
  getLocalChaptersByBookId,
  saveLocalBook,
  updateLocalBook,
  deleteLocalBook,
} from '../localBookStorage';

export function useLocalBooks() {
  const [localBooks, setLocalBooks] = useState<LocalBook[]>([]);
  const [localChapters, setLocalChapters] = useState<LocalChapter[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load local books on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const storage = getLocalBooks();
    setLocalBooks(storage.books);
    setLocalChapters(storage.chapters);
    setIsLoaded(true);
  }, []);

  // Create a new local book
  const createLocalBook = (book: LocalBook, chapters: LocalChapter[]) => {
    saveLocalBook(book, chapters);
    
    // Update state
    setLocalBooks(prev => {
      const existingIndex = prev.findIndex(b => b.localBookId === book.localBookId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = book;
        return updated;
      }
      return [...prev, book];
    });
    
    setLocalChapters(prev => {
      const filtered = prev.filter(c => c.bookId !== book.localBookId);
      return [...filtered, ...chapters];
    });
  };

  // Update an existing local book
  const updateLocalBookState = (book: LocalBook, chapters?: LocalChapter[]) => {
    updateLocalBook(book, chapters);
    
    // Update state
    setLocalBooks(prev => {
      const index = prev.findIndex(b => b.localBookId === book.localBookId);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = book;
        return updated;
      }
      return prev;
    });
    
    if (chapters) {
      setLocalChapters(prev => {
        const filtered = prev.filter(c => c.bookId !== book.localBookId);
        return [...filtered, ...chapters];
      });
    }
  };

  // Delete a local book
  const removeLocalBook = (bookId: string) => {
    deleteLocalBook(bookId);
    
    setLocalBooks(prev => prev.filter(b => b.localBookId !== bookId));
    setLocalChapters(prev => prev.filter(c => c.bookId !== bookId));
  };

  // Get a specific local book
  const getLocalBook = (bookId: string): LocalBook | null => {
    return localBooks.find(b => b.localBookId === bookId) || null;
  };

  // Get chapters for a specific local book
  const getChaptersForBook = (bookId: string): LocalChapter[] => {
    return localChapters.filter(c => c.bookId === bookId);
  };

  // Check if a book is local
  const isLocalBook = (bookId: string): boolean => {
    return localBooks.some(b => b.localBookId === bookId);
  };

  return {
    localBooks,
    localChapters,
    isLoaded,
    createLocalBook,
    updateLocalBook: updateLocalBookState,
    removeLocalBook,
    getLocalBook,
    getChaptersForBook,
    isLocalBook,
  };
}
