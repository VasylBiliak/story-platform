"use client";

import { BookCard } from "@/components/book/BookCard";
import { Book } from "@/lib/types";

type ExtendedBook = Book & { isLocal?: boolean };

interface Props {
  books: ExtendedBook[];
}

export function RemotwBooksGrid({ books }: Props) {
  if (!books.length) {
    return (
      <p className="text-text-secondary text-center py-12">
        No books available.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}