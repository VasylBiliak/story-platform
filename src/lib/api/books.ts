import { Book } from '@/lib/types';
import { PaginatedResponse, PaginationParams } from '@/types';

async function fetchApi<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    headers: { "Accept": "application/json" },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload?.success) {
    const message = payload?.error || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload.data as T;
}

export async function getBooks(): Promise<Book[]> {
  return fetchApi<Book[]>('/api/books');
}

export async function getBooksWithPagination(params: PaginationParams = {}): Promise<PaginatedResponse<Book>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  
  return fetchApi<PaginatedResponse<Book>>(`/api/books?${searchParams.toString()}`);
}

export async function getBookById(id: string): Promise<Book | null> {
  return fetchApi<Book>(`/api/books/${encodeURIComponent(id)}`);
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  return getBookById(slug);
}
