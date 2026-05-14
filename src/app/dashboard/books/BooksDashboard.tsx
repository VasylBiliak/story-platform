"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Chapter } from "@/lib/types";
import { getBooks } from "@/lib/api/books";
import { getChaptersByBookSorted } from "@/lib/api/chapters";
import { BookForm } from "@/components/books/BookForm";
import { useLocalBooks } from "@/lib/local-books/hooks/useLocalBooks";
import { LocalBook, LocalChapter } from "@/lib/local-books/localBook.types";
import { LocalBooksGrid } from "@/components/books/LocalBooksGrid";

export function BooksDashboard() {
  const [remoteBooks, setRemoteBooks] = useState<Book[]>([]);
  const [remoteChapters, setRemoteChapters] = useState<Chapter[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { localBooks, localChapters, isLoaded: localLoaded } = useLocalBooks();

  const loadData = async () => {
    const loadedBooks = await getBooks();
    setRemoteBooks(loadedBooks);

    const chapterLists = await Promise.all(
      loadedBooks.map((book) => getChaptersByBookSorted(book.id)),
    );

    setRemoteChapters(chapterLists.flat());
    setLoaded(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async () => {
    await loadData();
  };

  // Merge remote and local books
  const allBooks = [...remoteBooks, ...localBooks] as (Book | LocalBook)[];
  const allChapters = [...remoteChapters, ...localChapters] as (Chapter | LocalChapter)[];

  const getChaptersForBook = (bookId: string) =>
    allChapters.filter((c) => c.bookId === bookId);

  if (!loaded || !localLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="card card-hover rounded-xl p-6">
        <BookForm mode="create" onSubmit={handleSubmit} />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-6">Your Books</h2>
        <h2 className="font-[Oswald] text-2xl font-bold uppercase tracking-[3px] mb-8 text-text-primary">
          Local Books
        </h2>
        <LocalBooksGrid />
        {allBooks.length === 0 ? (
          <p className="text-text-secondary">No books yet. Create one above!</p>
        ) : (      
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          </div>
        )}
      </div>
    </div>
  );
}
