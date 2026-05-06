import { findAllBooks, findBookById, createBookWithChapters, updateBookWithChapters, deleteBookById } from "@/server/repositories/bookRepository";
import { findChaptersByBookId } from "@/server/repositories/chapterRepository";

export async function getBooks() {
  return findAllBooks();
}

export async function getBookById(bookId: string) {
  return findBookById(bookId);
}

export async function createBook(userId: string, payload: {
  title: string;
  description: string;
  cover: string;
  author: string;
  chapters: Array<{
    title: string;
    slug: string;
    content: string;
    isFree: boolean;
    price?: number;
    discount?: number;
    finalPrice?: number;
  }>;
}) {
  return createBookWithChapters(userId, payload);
}

export async function updateBook(bookId: string, payload: {
  title: string;
  description: string;
  cover: string;
  chapters: Array<{
    title: string;
    slug: string;
    content: string;
    isFree: boolean;
    price?: number;
    discount?: number;
    finalPrice?: number;
  }>;
}) {
  return updateBookWithChapters(bookId, payload);
}

export async function deleteBook(bookId: string) {
  return deleteBookById(bookId);
}

export async function getBookChapters(bookId: string) {
  return findChaptersByBookId(bookId);
}
