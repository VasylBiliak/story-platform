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

            {/*<RemotwBooksGrid books={book} />  */}
{/*             <AnimatePresence mode="popLayout">
              {allBooks.map((book: Book | LocalBook) => (
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
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-text-primary truncate">
                            {book.title}
                          </h3>
                          {"isLocal" in book && book.isLocal && (
                            <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md border border-accent-primary text-accent-primary bg-accent-primary/10 flex-shrink-0">
                              Local
                            </span>
                          )}
                        </div>
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
                          {getChaptersForBook(book.id).map((chapter) => (
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
                                {chapter.images && chapter.images.length > 0 && (
                                  <span className="text-xs text-text-tertiary flex-shrink-0">
                                    ({chapter.images.length} img{chapter.images.length > 1 ? "s" : ""})
                                  </span>
                                )}
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
                                {!chapter.isFree && chapter.finalPrice !== undefined && (
                                  <div className="text-right">
                                    <div className="text-xs font-semibold text-accent-primary">
                                      ${chapter.finalPrice.toFixed(2)}
                                    </div>
                                    {chapter.discount && chapter.discount > 0 && chapter.price && (
                                      <div className="text-xs text-text-tertiary">
                                        <span className="line-through">${chapter.price.toFixed(2)}</span>
                                        <span className="ml-1">-{chapter.discount}%</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence> */}
          </div>
        )}
      </div>
    </div>
  );
}
