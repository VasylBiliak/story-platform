"use client";

import React, { useState, useEffect } from "react";
import { getBooks as getStaticBooks } from "@/lib/api/books";
import { getBooks as getLocalBooks } from "@/lib/storage";
import { Book } from "@/lib/types";
import { RemotwBooksGrid } from "@/components/books/RemotwBooksGrid";
import { LocalBooksGrid } from "@/components/books/LocalBooksGrid";

type ExtendedBook = Book & { isLocal?: boolean };

export default function Library() {
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
      if (typeof window !== "undefined") {
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
      <section className="px-4 sm:px-6 md:px-10 py-10">
        <p className="text-text-secondary text-center py-12">
          Loading books...
        </p>
      </section>
    );
  }

  return (
    <section className="px-2 sm:px-4 md:px-8 py-8">
      <h1 className="font-[Oswald] text-3xl font-bold uppercase tracking-[3px] mb-8 text-text-primary flex justify-center align-center">
        Library
      </h1>
      <LocalBooksGrid />


      <RemotwBooksGrid books={books} />
    </section>
  );
};
