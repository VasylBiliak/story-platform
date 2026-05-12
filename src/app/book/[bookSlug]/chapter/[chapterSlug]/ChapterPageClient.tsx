"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Book, Chapter } from "@/lib/types";
import { Paywall } from "@/components/chapter/Paywall";
import { LockIcon } from "@/components/ui/LockIcon";
import { BookOpenIcon } from "@/components/ui/BookOpenIcon";
import { ChapterNavigation } from "@/components/chapterNavigation/ChapterNavigation";
import ChapterImages from "@/components/chapterImages/ChapterImages";

export default function ChapterPageClient() {
  const params = useParams();
  const bookSlug = params.bookSlug as string;
  const chapterSlug = params.chapterSlug as string;

  const [book, setBook] = useState<Book | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch book data from backend API
        const bookResponse = await fetch(`/api/books/${encodeURIComponent(bookSlug)}`);
        const bookPayload = await bookResponse.json();

        if (!bookPayload?.success || !bookPayload.data) {
          setError(bookPayload?.error || "Book not found");
          setBook(null);
          setChapter(null);
          setChapters([]);
          setLoading(false);
          return;
        }

        const foundBook = bookPayload.data;
        const foundChapter = foundBook.chapters?.find((c: Chapter) => c.slug === chapterSlug);
        const allChapters = foundBook.chapters || [];

        setBook(foundBook);
        setChapter(foundChapter || null);
        setChapters(allChapters);
      } catch (err) {
        console.error("Error loading chapter data:", err);
        setError("Failed to load chapter data");
        setBook(null);
        setChapter(null);
        setChapters([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [bookSlug, chapterSlug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-text-secondary">Loading chapter...</p>
      </div>
    );
  }

  if (error || !book || !chapter) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Chapter Not Found</h1>
        <p className="text-text-secondary mb-6">
          {error || "The chapter you are looking for does not exist."}
        </p>
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-tertiary mb-8">
        <Link href="/" className="hover:text-accent-primary transition-colors">
          Home
        </Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link
          href={`/book/${book.id}`}
          className="hover:text-text-primary transition-colors truncate max-w-xs"
        >
          {book.title}
        </Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-text-primary truncate max-w-xs">{chapter.title}</span>
      </nav>

      {/* Chapter Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${chapter.isFree
                ? "bg-status-success-bg text-status-success"
                : "bg-status-warning-bg text-status-warning"
                }`}
            >
              {chapter.isFree ? (
                <>
                  <BookOpenIcon className="w-4 h-4" />
                  FREE
                </>
              ) : (
                <>
                  <LockIcon className="w-4 h-4" />
                  PREMIUM
                </>
              )}
            </span>

            {!chapter.isFree && (
              <div className="flex items-center gap-2">
                {chapter.discount && chapter.discount > 0 && chapter.price && (
                  <span className="text-xs text-text-tertiary line-through">
                    ${chapter.price.toFixed(2)}
                  </span>
                )}
                <span className="text-lg font-bold text-accent-primary">
                  ${(chapter.finalPrice || 0).toFixed(2)}
                </span>
                {chapter.discount && chapter.discount > 0 && (
                  <span className="text-xs text-text-tertiary">
                    -{chapter.discount}%
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
          {chapter.title}
        </h1>
        <p className="text-text-tertiary">
          From{" "}
          <Link
            href={`/book/${book.id}`}
            className="text-accent-primary hover:text-accent-primary-hover font-medium"
          >
            {book.title}
          </Link>{" "}
          by {book.author}
        </p>
      </header>

      {/* Chapter Content */}
      <article className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
        {chapter.isFree ? (
          <div className="p-8 sm:p-12">
            <div className="prose prose-lg max-w-none">
              {chapter.content.split("\n\n").map((paragraph, index) => (
                <p key={index} className="text-text-secondary leading-relaxed mb-6 text-lg">
                  {paragraph}
                </p>
              ))}
            </div>

            <ChapterImages images={chapter.images || []} />

            <div className="mt-12 pt-8 border-t border-border">
              <div className="bg-accent-primary/10 rounded-lg p-6 text-center">
                <h3 className="font-semibold text-text-primary mb-2">Enjoying the story?</h3>
                <p className="text-text-secondary mb-6">
                  {chapter.isFree
                    ? "This chapter is free to read. Enjoy the content!"
                    : "Unlock this premium chapter to continue reading."
                  }
                </p>

                {<Link
                  href={chapter.isFree ? `/book/${book.id}` : "#"}
                  className={`inline-flex items-center justify-center px-8 py-3 font-medium rounded-lg transition-all transform hover:scale-105 ${chapter.isFree
                    ? "bg-status-success text-white hover:bg-status-success-hover"
                    : "bg-accent-primary text-white hover:bg-accent-primary-hover shadow-lg"
                    }`}
                >
                  {chapter.isFree ? (
                    <button
                      type="button"
                      className=" display flex items-center justify-center text-lg 
                      cursor-pointer overflow-hidden border-2 border-accent-primary 
                      px-8 py-4 tracking-[0.15em] text-accent-primary transition-all 
                      duration-200 
                      hover:bg-accent-primary hover:text-bg-primary active:scale-95 
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                    >
                      <BookOpenIcon className="w-4 h-4 mr-2" />Read for Free
                    </button>
                  ) : (
                    <button
                      type="button"
                      className=" display flex items-center justify-center text-lg 
                      cursor-pointer overflow-hidden border-2 border-accent-primary 
                      px-8 py-4 tracking-[0.15em] text-accent-primary transition-all 
                      duration-200 
                      hover:bg-accent-primary hover:text-bg-primary active:scale-95 
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                    >
                      Buy for ${(chapter.finalPrice || 0).toFixed(2)}
                    </button>

                  )}
                </Link>}
              </div>
            </div>
          </div>
        ) : (
          <Paywall chapter={chapter} />
        )}
      </article>

      <ChapterNavigation chapters={chapters} currentSlug={chapter.slug} bookId={book.id} />

      {/* Navigation */}
      <nav className="mt-8 flex items-center justify-between">
        <Link
          href={`/book/${book.id}`}
          className="inline-flex items-center text-text-secondary hover:text-text-primary font-medium transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Book
        </Link>
      </nav>
    </div>
  );
}
