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
import { LoadMoreButton } from "@/components/ui/LoadMoreButton/LoadMoreButton";
import { useBooksPagination } from "@/lib/hooks/useBooksPagination";
import { useAuth } from "@/components/auth/AuthProvider";

export function BooksDashboard() {
  const [remoteChapters, setRemoteChapters] = useState<Chapter[]>([]);
  const { localBooks, localChapters, isLoaded: localLoaded } = useLocalBooks();
  const { user } = useAuth();
  
  const {
    books: remoteBooks,
    isLoading: remoteLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  } = useBooksPagination({ initialLimit: 8, mergeWithLocal: false });

  // Load chapters for remote books
  useEffect(() => {
    async function loadChapters() {
      const chapterLists = await Promise.all(
        remoteBooks.map((book) => getChaptersByBookSorted(book.id)),
      );
      setRemoteChapters(chapterLists.flat());
    }

    if (remoteBooks.length > 0) {
      loadChapters();
    }
  }, [remoteBooks]);

  const handleSubmit = async () => {
    await refresh();
  };

  const allBooks = [...remoteBooks, ...localBooks] as (Book | LocalBook)[];
  const allChapters = [...remoteChapters, ...localChapters] as (Chapter | LocalChapter)[];

  const getChaptersForBook = (bookId: string) =>
    allChapters.filter((c) => c.bookId === bookId);

  if (!localLoaded) {
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
        <LocalBooksGrid />
        {/* Remote Books with Pagination */}
        <h3 className="font-[Oswald] text-2xl font-bold uppercase tracking-[3px] mb-8 text-text-primary">
          Published Books
        </h3>
        
        {remoteLoading && remoteBooks.length === 0 ? (
          <p className="text-text-secondary">Loading books...</p>
        ) : remoteBooks.length === 0 ? (
          <p className="text-text-secondary">No published books yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {remoteBooks.map((book: Book) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="card rounded-xl overflow-hidden"
                  >
                    <div className="p-5 border-b border-border">
                      <div className="flex items-start gap-4">
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-16 h-24 object-cover rounded-md flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold text-text-primary truncate">
                            {book.title}
                          </h3>
                          <p className="text-sm text-text-secondary">{book.author}</p>
                          <p className="text-sm text-text-tertiary mt-1 line-clamp-2">
                            {book.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">
                        Chapters ({getChaptersForBook(book.id).length})
                      </h4>
                      {getChaptersForBook(book.id).length === 0 ? (
                        <p className="text-sm text-text-tertiary">No chapters yet.</p>
                      ) : (
                        <ul className="space-y-2">
                          <AnimatePresence>
                            {getChaptersForBook(book.id).slice(0, 3).map((chapter) => (
                              <motion.li
                                key={chapter.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-border-hover transition"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-sm text-text-primary truncate">
                                    {chapter.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                                      chapter.isFree
                                        ? "border-border text-text-secondary"
                                        : "border-accent-primary text-accent-primary"
                                    }`}
                                  >
                                    {chapter.isFree ? "FREE" : "LOCKED"}
                                  </span>
                                </div>
                              </motion.li>
                            ))}
                          </AnimatePresence>
                          {getChaptersForBook(book.id).length > 3 && (
                            <p className="text-xs text-text-tertiary text-center py-2">
                              +{getChaptersForBook(book.id).length - 3} more chapters
                            </p>
                          )}
                        </ul>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <LoadMoreButton
              onClick={loadMore}
              isLoading={isLoadingMore}
              hasMore={hasMore}
            />
          </>
        )}
      </div>
    </div>
  );
}
