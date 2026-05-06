import { Chapter } from '@/lib/types';

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

export async function getChaptersByBook(bookId: string): Promise<Chapter[]> {
  return fetchApi<Chapter[]>(`/api/chapters?bookId=${encodeURIComponent(bookId)}`);
}

export async function getChapterById(id: string): Promise<Chapter | null> {
  const result = await fetchApi<Chapter[]>(`/api/chapters?chapterId=${encodeURIComponent(id)}`);
  return result?.[0] ?? null;
}

export async function getChaptersByBookSorted(bookId: string): Promise<Chapter[]> {
  const bookChapters = await getChaptersByBook(bookId);
  return bookChapters.sort((a, b) => {
    const numA = parseInt(a.id.split('-').pop() || '0');
    const numB = parseInt(b.id.split('-').pop() || '0');
    return numA - numB;
  });
}

export async function getChapterBySlug(bookId: string, slug: string): Promise<Chapter | null> {
  const chapters = await fetchApi<Chapter[]>(
    `/api/chapters?bookId=${encodeURIComponent(bookId)}&slug=${encodeURIComponent(slug)}`,
  );
  return chapters?.[0] ?? null;
}
