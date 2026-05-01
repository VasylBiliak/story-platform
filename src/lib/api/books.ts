import { books } from '@/data/books';
import { Book } from '@/lib/types';

export type { Book };

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getBooks(): Promise<Book[]> {
  // Simulate network request
  await delay(300);
  
  // In the future, this will be replaced with:
  // const response = await fetch('/api/books');
  // return response.json();
  
  return books;
}

export async function getBookById(id: string): Promise<Book | null> {
  // Simulate network request
  await delay(200);

  // In the future, this will be replaced with:
  // const response = await fetch(`/api/books/${id}`);
  // return response.json();

  const book = books.find(b => b.id === id);
  return book || null;
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  // Book IDs are already URL-friendly slugs
  return getBookById(slug);
}
