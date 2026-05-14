/**
 * useUserBooksPagination hook
 * Manages paginated fetching of books belonging to the current authenticated user
 * Merges local books with backend books
 */

import { useBooksPagination } from "./useBooksPagination";

interface UseUserBooksPaginationOptions {
  userId: string;
  initialLimit?: number;
}

export function useUserBooksPagination(options: UseUserBooksPaginationOptions) {
  const { userId, initialLimit = 8 } = options;

  return useBooksPagination({
    ownerId: userId,
    initialLimit,
    mergeWithLocal: true,
  });
}
