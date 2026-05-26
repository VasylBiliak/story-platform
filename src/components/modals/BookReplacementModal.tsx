"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Book {
  id: string;
  title: string;
  cover: string;
  author: string;
  createdAt: string;
}

interface Props {
  isOpen: boolean;
  books: Book[];
  selectedBookId: string | null;
  onSelectBook: (bookId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BookReplacementModal({
  isOpen,
  books,
  selectedBookId,
  onSelectBook,
  onConfirm,
  onCancel,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-bg-primary border border-border rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Demo Book Limit Reached
          </h2>
          <p className="text-text-secondary mb-6">
            You already reached the maximum of 3 books available in the demo version. Select a book to replace.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {books.map((book) => (
              <motion.div
                key={book.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectBook(book.id)}
                className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                  selectedBookId === book.id
                    ? "border-accent-primary bg-accent-primary/10"
                    : "border-border hover:border-border-hover"
                }`}
              >
                <div className="flex gap-4">
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
                    <p className="text-xs text-text-tertiary mt-1">
                      {new Date(book.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-border-hover transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!selectedBookId}
              className="px-4 py-2 rounded-lg btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Replace Selected Book
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
