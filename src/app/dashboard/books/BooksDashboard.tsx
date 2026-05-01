"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Chapter } from "@/lib/types";
import { getBooks, saveBooks, getChapters, saveChapters } from "@/lib/storage";
import { CreateBookWithChaptersForm } from "@/components/forms/CreateBookWithChaptersForm";

export function BooksDashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setBooks(getBooks());
    setChapters(getChapters());
    setLoaded(true);
  }, []);

  const handleCreate = (newBook: Book, newChapters: Chapter[]) => {
    const updatedBooks = [...books, newBook];
    const updatedChapters = [...chapters, ...newChapters];
    setBooks(updatedBooks);
    setChapters(updatedChapters);
    saveBooks(updatedBooks);
    saveChapters(updatedChapters);
    console.log("Created Book:", newBook);
    console.log("Created Chapters:", newChapters);
  };

  const getChaptersForBook = (bookId: string) =>
    chapters.filter((c) => c.bookId === bookId);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="card card-hover rounded-xl p-6">
        <CreateBookWithChaptersForm onCreate={handleCreate} />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-6">Your Books</h2>
        {books.length === 0 ? (
          <p className="text-text-secondary">No books yet. Create one above!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {books.map((book) => (
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
                      <div className="min-w-0">
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
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                                  chapter.isFree
                                    ? "border-border text-text-secondary"
                                    : "border-accent-primary text-accent-primary"
                                }`}
                              >
                                {chapter.isFree ? "FREE" : "LOCKED"}
                              </span>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
