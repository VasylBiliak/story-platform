/**
 * Local book type definitions
 * These extend the base Book/Chapter types with local-specific metadata
 */

import { Book, Chapter } from '@/types';

export interface LocalBook extends Book {
  isLocal: true;
  localBookId: string;
  createdLocallyAt: string;
  updatedAt: string;
}

export interface LocalChapter extends Chapter {
  isLocal: true;
  localChapterId: string;
}

export interface LocalBookStorage {
  books: LocalBook[];
  chapters: LocalChapter[];
}

export type LocalBookInput = Omit<LocalBook, 'isLocal' | 'localBookId' | 'createdLocallyAt' | 'updatedAt'>;
export type LocalChapterInput = Omit<LocalChapter, 'isLocal' | 'localChapterId' | 'bookId'>;
