"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Book, Chapter } from "@/lib/types";
import { getBooks, getChapters } from "@/lib/storage";
import { BookForm } from "@/components/books/BookForm";
import { useAuth } from "@/components/auth/AuthProvider";

export default function EditBookPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;
  const { user, isLoading: authLoading } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth guard - redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Don't load book data until auth is checked
    if (authLoading || !user) return;

    const books = getBooks();
    const foundBook = books.find((b) => b.id === bookId);

    if (!foundBook) {
      router.push("/dashboard/books");
      return;
    }

    // Ownership check - only allow editing own books
    if (foundBook.author !== user.name) {
      console.log("Access denied: Not the book author");
      router.push("/dashboard/books");
      return;
    }

    const allChapters = getChapters();
    const bookChapters = allChapters.filter((c) => c.bookId === bookId);

    setBook(foundBook);
    setChapters(bookChapters);
    setLoading(false);
  }, [bookId, router, user, authLoading]);

  const handleSubmit = () => {
    router.push("/dashboard/books");
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Book Not Found</h1>
        <p className="text-text-secondary mb-6">
          The book you are trying to edit does not exist or has been removed.
        </p>
        <a
          href="/dashboard/books"
          className="text-accent-primary hover:text-accent-primary-hover font-medium"
        >
          Back to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <a
          href="/dashboard/books"
          className="inline-flex items-center text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </a>
      </div>

      <h1 className="text-3xl font-bold text-text-primary mb-2">Edit Book</h1>
      <p className="text-text-secondary mb-8">
        Update your book and chapter details
      </p>

      <div className="card card-hover rounded-xl p-6">
        <BookForm
          mode="edit"
          initialData={{ book, chapters }}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}