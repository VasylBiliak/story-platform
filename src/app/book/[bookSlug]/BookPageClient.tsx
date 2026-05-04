"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Book, Chapter } from "@/lib/types";
import { getBooks as getLocalBooks, getChapters as getLocalChapters } from "@/lib/storage";
import { getBooks as getStaticBooks, getBookBySlug as getStaticBookBySlug } from "@/lib/api/books";
import { getChaptersByBookSorted as getStaticChaptersByBook } from "@/lib/api/chapters";
import { ChapterListItem } from "@/components/chapter/ChapterListItem";
import { useAuth } from '@/components/auth/AuthProvider';


function isLocalBook(bookId: string, localBooks: Book[]): boolean {
  return localBooks.some((b) => b.id === bookId);
}

export default function BookPageClient() {
  const params = useParams();
  const bookSlug = params.bookSlug as string;
  const { user, isLoading } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Try static data first
      let foundBook = await getStaticBookBySlug(bookSlug);
      let foundChapters: Chapter[] = [];

      if (foundBook) {
        foundChapters = await getStaticChaptersByBook(foundBook.id);
      } else {
        // Fallback to localStorage
        const localBooks = getLocalBooks();
        foundBook = localBooks.find((b) => b.id === bookSlug) || null;
        if (foundBook) {
          const localChapters = getLocalChapters();
          foundChapters = localChapters
            .filter((c) => c.bookId === foundBook!.id)
            .sort((a, b) => {
              const numA = parseInt(a.id.split("-").pop() || "0");
              const numB = parseInt(b.id.split("-").pop() || "0");
              return numA - numB;
            });
        }
      }

      setBook(foundBook);
      setChapters(foundChapters);
      setLoading(false);
    }

    loadData();
  }, [bookSlug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Book Not Found</h1>
        <p className="text-text-secondary mb-6">The book you are looking for does not exist.</p>
        <Link
          href="/"
          className="inline-flex items-center text-accent-primary hover:text-accent-primary-hover font-medium transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    );
  }

  const freeChapters = chapters.filter((c) => c.isFree).length;
  const paidChapters = chapters.filter((c) => !c.isFree).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-8">
        <Link href="/" className="hover:text-accent-primary transition-colors">
          Home
        </Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-text-primary truncate max-w-xs">{book.title}</span>
      </nav>

      {/* Book Header */}
      <div className="rounded-2xl shadow-sm border border-border overflow-hidden mb-12">
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 p-8">

          {/* Edit */}

          {user && user.name === book.author && isLocalBook(book.id, getLocalBooks()) && (
            <Link
              href={`/dashboard/books/edit/${book.id}`}
              className="absolute top-4 right-4 md:top-8 md:right-8 
    inline-flex items-center justify-center p-2 
    md:px-4 md:py-2 border 
    border-accent-primary text-accent-primary 
    rounded-lg hover:bg-accent-primary hover:text-white 
    transition-colors z-10 bg-bg-primary"
              title="Edit Book"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="hidden md:inline ml-2 font-medium">Edit</span>
            </Link>
          )}

          <div className="relative aspect-[2/3] w-full max-w-xs mx-auto md:mx-0 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={book.cover}
              alt={`Cover of ${book.title}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 300px"
              priority
            />
          </div>
          <div className="md:col-span-2 flex flex-col justify-start">
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              {book.title}
            </h1>
            <p className="text-lg text-accent-primary font-medium mb-4">
              by {book.author}
            </p>
            <p className="text-text-secondary leading-relaxed mb-6 text-lg">
              {book.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center px-3 py-1 
              rounded-full text-sm font-medium 
              bg-success-bg">
                {freeChapters} Free Chapter{freeChapters !== 1 ? "s" : ""}
              </span>
              {paidChapters > 0 && (
                <span className="inline-flex items-center px-3 py-1 
                rounded-full text-sm font-medium 
                border-2 
          border-accent-buy tracking-[0.15em] transition-all">
                  {paidChapters} Premium Chapter{paidChapters !== 1 ? "s" : ""}
                </span>
              )}
            </div>


            {book.images && book.images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {book.images.map((src, i) => (
                  <img key={i} src={src} alt={`Book image ${i + 1}`} className="w-16 h-16 object-cover rounded-lg border border-border" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chapters Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Chapters</h2>
          <span className="text-sm text-text-tertiary">
            {chapters.length} {chapters.length === 1 ? "chapter" : "chapters"}
          </span>
        </div>

        {chapters.length > 0 ? (
          <div className="space-y-3">
            {chapters.map((chapter) => (
              <ChapterListItem key={chapter.id} chapter={chapter} bookSlug={book.id} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-bg-secondary rounded-xl border border-border">
            <p className="text-text-tertiary">No chapters available yet. Check back soon!</p>
          </div>
        )}
      </section>
    </div>
  );
}
