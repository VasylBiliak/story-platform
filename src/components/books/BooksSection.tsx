"use client";

import { Book } from "@/lib/types";
import { RemotwBooksGrid } from "@/components/books/RemotwBooksGrid";
import { LoadMoreButton } from "@/components/ui/LoadMoreButton/LoadMoreButton";
import { Button } from "@/components/ui/Button/Button";

type ExtendedBook = Book & { isLocal?: boolean };

interface BooksSectionProps {
  title: string;
  books: ExtendedBook[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
}

export function BooksSection({
  title,
  books,
  isLoading,
  isLoadingMore,
  hasMore,
  loadMore,
  emptyMessage = "No books available.",
  emptyAction,
}: BooksSectionProps) {
  return (
    <section>
      <h2 className="font-[Oswald] text-2xl font-bold uppercase tracking-[3px] mb-8 text-text-primary">
        {title}
      </h2>
      {isLoading && books.length === 0 ? (
        <p className="text-text-secondary text-center py-12">
          Loading books...
        </p>
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary mb-4">{emptyMessage}</p>
          {emptyAction && (
            <Button variant="primary" onClick={emptyAction.onClick}>
              {emptyAction.label}
            </Button>
          )}
        </div>
      ) : (
        <>
          <RemotwBooksGrid books={books} />
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
