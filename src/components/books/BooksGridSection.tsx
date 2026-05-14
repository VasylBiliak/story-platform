"use client";

import { BookCard } from "@/components/book/BookCard";
import { Book } from "@/lib/types";

type ExtendedBook = Book & { isLocal?: boolean };

interface Props {
  localBooks: ExtendedBook[];
  remoteBooks: ExtendedBook[];
}

export function BooksGridSection({ localBooks, remoteBooks }: Props) {
  return (
    <div className="space-y-10">
      {/* LOCAL */}
      <section>
        <h2 className="font-[Oswald] text-2xl font-bold uppercase tracking-[3px] mb-6 text-text-primary">
          Local Books
        </h2>

        {localBooks.length === 0 ? (
          <p className="text-text-secondary">No local books.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {localBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* REMOTE */}
      <section>
        <h2 className="font-[Oswald] text-2xl font-bold uppercase tracking-[3px] mb-6 text-text-primary">
          Books
        </h2>

        {remoteBooks.length === 0 ? (
          <p className="text-text-secondary">No books available.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {remoteBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}