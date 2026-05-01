import { chapters } from '@/data/chapters';
import { Chapter } from '@/lib/types';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getChaptersByBook(bookId: string): Promise<Chapter[]> {
  // Simulate network request
  await delay(250);
  
  // In the future, this will be replaced with:
  // const response = await fetch(`/api/books/${bookId}/chapters`);
  // return response.json();
  
  return chapters.filter(c => c.bookId === bookId);
}

export async function getChapterById(id: string): Promise<Chapter | null> {
  // Simulate network request
  await delay(200);
  
  // In the future, this will be replaced with:
  // const response = await fetch(`/api/chapters/${id}`);
  // return response.json();
  
  const chapter = chapters.find(c => c.id === id);
  return chapter || null;
}

export async function getChaptersByBookSorted(bookId: string): Promise<Chapter[]> {
  const bookChapters = await getChaptersByBook(bookId);
  // Sort by chapter number extracted from ID or keep original order
  return bookChapters.sort((a, b) => {
    const numA = parseInt(a.id.split('-').pop() || '0');
    const numB = parseInt(b.id.split('-').pop() || '0');
    return numA - numB;
  });
}

export async function getChapterBySlug(bookId: string, slug: string): Promise<Chapter | null> {
  await delay(200);
  const chapter = chapters.find(c => c.bookId === bookId && c.slug === slug);
  return chapter || null;
}
