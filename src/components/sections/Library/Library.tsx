"use client";

import React from "react";
import { Book } from "@/lib/types";
import { RemotwBooksGrid } from "@/components/books/RemotwBooksGrid";
import { LocalBooksGrid } from "@/components/books/LocalBooksGrid";
import { LoadMoreButton } from "@/components/ui/LoadMoreButton/LoadMoreButton";
import { useBooksPagination } from "@/lib/hooks/useBooksPagination";

type ExtendedBook = Book & { isLocal?: boolean };

export default function Library() {
  const {
    books: remoteBooks,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  } = useBooksPagination({ initialLimit: 8, mergeWithLocal: false });

  const mappedRemoteBooks: ExtendedBook[] = remoteBooks.map((b) => ({
    ...b,
    isLocal: false,
  }));

  return (
    <section className="flex flex-col gap-8 px-2 sm:px-4 md:px-8 py-8" id="books">
      <h1 className="font-[Oswald] text-3xl font-bold uppercase tracking-[3px] mb-8 text-text-primary flex justify-center align-center">
        Library
      </h1>
      
      {/* Local Books */}
      <LocalBooksGrid />

      {/* Remote Books with Pagination */}
      {isLoading && remoteBooks.length === 0 ? (
        <p className="text-text-secondary text-center py-12">
          Loading books...
        </p>
      ) : (
        <>
          <RemotwBooksGrid books={mappedRemoteBooks} />
          <LoadMoreButton
            onClick={loadMore}
            isLoading={isLoadingMore}
            hasMore={hasMore}
          />
        </>
      )}
    </section>
  );
}
