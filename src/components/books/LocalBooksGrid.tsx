"use client";

import { useLocalBooks } from "@/lib/local-books/hooks/useLocalBooks";
import { BookCard } from "@/components/book/BookCard";

export function LocalBooksGrid() {
  const { localBooks, isLoaded } = useLocalBooks();

  if (!isLoaded || localBooks.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {localBooks.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}