"use client";

import React, { useState, useEffect } from 'react';
import { BookCard } from '@/components/book/BookCard';
import { getBooks as getStaticBooks } from '@/lib/api/books';
import { getBooks as getLocalBooks } from '@/lib/storage';
import { Book } from '@/lib/types';

type ExtendedBook = Book & { isLocal?: boolean };

const BooksGrid: React.FC = () => {
  const [books, setBooks] = useState<ExtendedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBooks() {
      const staticBooks = await getStaticBooks();
      const mappedStatic: ExtendedBook[] = staticBooks.map((b) => ({
        ...b,
        isLocal: false,
      }));

      let localBooks: ExtendedBook[] = [];
      if (typeof window !== 'undefined') {
        localBooks = getLocalBooks()
          .filter((b) => !staticBooks.some((sb) => sb.id === b.id))
          .map((b) => ({ ...b, isLocal: true }));
      }

      setBooks([...mappedStatic, ...localBooks]);
      setIsLoading(false);
    }
    loadBooks();
  }, []);

  if (isLoading) {
    return (
      <section id="books" className="px-4 sm:px-6 md:px-10 py-10">
        <div className="text-center py-12">
          <p className="text-text-secondary">Loading books...</p>
        </div>
      </section>
    );
  }

  if (books.length === 0) {
    return (
      <section id="books" className="px-4 sm:px-6 md:px-10 py-10">
        <h2 className="font-[Oswald] text-2xl font-bold uppercase tracking-[3px] mb-8 text-text-primary">
          Featured Books
        </h2>
        <p className="text-text-secondary text-center py-12">No books available.</p>
      </section>
    );
  }

  return (
    <section id="books" className="px-4 sm:px-6 md:px-10 py-10">
      <h2 className="font-[Oswald] text-2xl font-bold uppercase tracking-[3px] mb-8 text-text-primary">
        Featured Books
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
};

export default BooksGrid;
