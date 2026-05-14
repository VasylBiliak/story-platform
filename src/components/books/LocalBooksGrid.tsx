"use client";

import React, { useState } from 'react';
import { useLocalBooks } from "@/lib/local-books/hooks/useLocalBooks";
import { BookCard } from "@/components/book/BookCard";
import { motion, AnimatePresence } from "framer-motion";

export function LocalBooksGrid() {
  const { localBooks, isLoaded } = useLocalBooks();
  const [isOpen, setIsOpen] = useState(false);

  if (!isLoaded || localBooks.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 border-t border-border pt-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between group focus:outline-none"
      >
        <h2 className="font-[Oswald] text-2xl font-bold uppercase tracking-[3px] text-text-primary transition-colors group-hover:text-accent-primary">
          Local Books
        </h2>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="text-accent-primary"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
              {localBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}