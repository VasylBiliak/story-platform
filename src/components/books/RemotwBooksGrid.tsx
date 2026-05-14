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
    <div className="">
      <h2 className="font-[Oswald] text-2xl font-bold uppercase tracking-[3px] mb-8 text-text-primary">
        Books
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}