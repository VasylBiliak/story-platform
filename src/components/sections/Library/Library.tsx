"use client";

import React, { useState } from "react";
import { Book } from "@/lib/types";
import { RemotwBooksGrid } from "@/components/books/RemotwBooksGrid";
import { LocalBooksGrid } from "@/components/books/LocalBooksGrid";
import { LoadMoreButton } from "@/components/ui/LoadMoreButton/LoadMoreButton";
import { BooksFilters } from "@/components/books/BooksFilters";
import { useBooksPagination } from "@/lib/hooks/useBooksPagination";

type ExtendedBook = Book & { isLocal?: boolean };

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const {
    books: remoteBooks,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  } = useBooksPagination({
    initialLimit: 8,
    mergeWithLocal: false,
    search: searchQuery,
    sort: sortOrder,
  });

  const mappedRemoteBooks: ExtendedBook[] = remoteBooks.map((b) => ({
    ...b,
    isLocal: false,
  }));

  const handleSearch = () => {
    refresh();
  };

  const handleSortChange = (value: "newest" | "oldest") => {
    setSortOrder(value);
    refresh();
  };

  return (
    <section className="flex flex-col gap-8 px-2 sm:px-4 md:px-8 py-8" id="books">
      <h1 className="font-[Oswald] text-3xl font-bold uppercase tracking-[3px] mb-8 text-text-primary flex justify-center align-center">
        Library
      </h1>     
      {/* Filters */}
      <BooksFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        isLoading={isLoading}
      />

      {/* Remote Books with Pagination */}
      {isLoading && remoteBooks.length === 0 ? (
        <p className="text-text-secondary text-center py-12">
          Loading books...
        </p>
      ) : remoteBooks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary mb-4">No books found</p>
        </div>
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
      <LocalBooksGrid />
    </section>
  );
}
