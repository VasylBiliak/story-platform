/**
 * useBooksPagination hook
 * Manages paginated fetching of books with local books support
 */

import { useState, useCallback, useEffect } from "react";
import { Book } from "@/types";
import { PaginatedResponse, PaginationMeta } from "@/types";
import { useLocalBooks } from "@/lib/local-books/hooks/useLocalBooks";

interface UseBooksPaginationOptions {
  initialLimit?: number;
  mergeWithLocal?: boolean;
}

interface UseBooksPaginationReturn {
  books: Book[];
  localBooks: Book[];
  allBooks: Book[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useBooksPagination(options: UseBooksPaginationOptions = {}): UseBooksPaginationReturn {
  const { initialLimit = 8, mergeWithLocal = true } = options;
  const { localBooks, isLoaded: localLoaded } = useLocalBooks();
  
  const [remoteBooks, setRemoteBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchBooks = useCallback(async (page: number, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: initialLimit.toString(),
      });

      const response = await fetch(`/api/books?${params.toString()}`, {
        headers: { "Accept": "application/json" },
      });

      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        const message = payload?.error || `HTTP ${response.status}`;
        throw new Error(message);
      }

      const data = payload.data as PaginatedResponse<Book>;
      
      if (isLoadMore) {
        setRemoteBooks(prev => [...prev, ...data.data]);
      } else {
        setRemoteBooks(data.data);
      }
      
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch books");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [initialLimit]);

  const loadMore = useCallback(async () => {
    if (!pagination || !pagination.hasMore || isLoadingMore) return;
    await fetchBooks(currentPage + 1, true);
  }, [pagination, currentPage, isLoadingMore, fetchBooks]);

  const refresh = useCallback(async () => {
    setCurrentPage(1);
    await fetchBooks(1, false);
  }, [fetchBooks]);

  useEffect(() => {
    fetchBooks(1, false);
  }, [fetchBooks]);

  // Merge local books with remote books
  const allBooks = mergeWithLocal && localLoaded
    ? [...localBooks, ...remoteBooks]
    : remoteBooks;

  const hasMore = pagination?.hasMore || false;

  return {
    books: remoteBooks,
    localBooks,
    allBooks,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
