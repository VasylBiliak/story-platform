"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Book, Chapter } from "@/lib/types";
import { getBookBySlug as getStaticBookBySlug } from "@/lib/api/books";
import { getChaptersByBookSorted as getStaticChaptersByBook } from "@/lib/api/chapters";
import { ChapterListItem } from "@/components/chapter/ChapterListItem";
import { BulkPurchaseSummary } from "@/components/chapter/BulkPurchaseSummary";
import { useAuth } from "@/components/auth/AuthProvider";
import { getLocalBookById, getLocalChaptersByBookId } from "@/lib/local-books/localBookStorage";
import { LocalBook, LocalChapter } from "@/lib/local-books/localBook.types";

export default function BookPageClient() {
  const params = useParams();
  const bookSlug = params.bookSlug as string;
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();

  const [book, setBook] = useState<Book | LocalBook | null>(null);
  const [chapters, setChapters] = useState<Chapter[] | LocalChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapterIds, setSelectedChapterIds] = useState<Set<string>>(new Set());
  const [isBulkPurchasing, setIsBulkPurchasing] = useState(false);
  const [bulkPurchaseError, setBulkPurchaseError] = useState<string | null>(null);

  const loadData = async () => {
    // First check if it's a local book
    const localBook = getLocalBookById(bookSlug);

    if (localBook) {
      const localChapters = getLocalChaptersByBookId(bookSlug);
      setBook(localBook);
      setChapters(localChapters);
      setLoading(false);
      return;
    }

    // Fall back to API
    const foundBook = await getStaticBookBySlug(bookSlug);
    const foundChapters = foundBook ? await getStaticChaptersByBook(foundBook.id) : [];

    setBook(foundBook);
    setChapters(foundChapters);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [bookSlug]);

  // Check for payment status in URL
  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      // Reload data to update purchased status
      loadData();
    }
  }, [searchParams]);

  // Memoize eligible chapters (paid and not purchased)
  const eligibleChapters = useMemo(() => {
    return chapters.filter((c) => !c.isFree && !c.purchased);
  }, [chapters]);

  // Memoize total price of selected chapters
  const totalPrice = useMemo(() => {
    let total = 0;
    selectedChapterIds.forEach((id) => {
      const chapter = chapters.find((c) => c.id === id);
      if (chapter && chapter.finalPrice !== undefined) {
        total += chapter.finalPrice;
      }
    });
    return total;
  }, [selectedChapterIds, chapters]);

  // Handle chapter selection toggle
  const handleChapterToggle = (chapterId: string) => {
    setSelectedChapterIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  // Handle select all toggle
  const handleSelectAllToggle = () => {
    if (selectedChapterIds.size === eligibleChapters.length) {
      setSelectedChapterIds(new Set());
    } else {
      const eligibleIds = eligibleChapters.map((c) => c.id);
      setSelectedChapterIds(new Set(eligibleIds));
    }
  };

  // Handle bulk purchase
  const handleBulkPurchase = async () => {
    if (selectedChapterIds.size === 0) return;

    try {
      setIsBulkPurchasing(true);
      setBulkPurchaseError(null);

      const response = await fetch('/api/stripe/create-bulk-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapterIds: Array.from(selectedChapterIds),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create bulk checkout session');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Bulk purchase error:', err);
      setBulkPurchaseError(err instanceof Error ? err.message : 'Failed to initiate bulk purchase');
    } finally {
      setIsBulkPurchasing(false);
    }
  };

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
  const showBottomSelectAll = chapters.length > 10;

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

          {user && user.name === book.author && (
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

        {/* Purchase Summary */}
        {selectedChapterIds.size > 0 && (
          <BulkPurchaseSummary
            selectedCount={selectedChapterIds.size}
            totalCount={eligibleChapters.length}
            totalPrice={totalPrice}
            onPurchase={handleBulkPurchase}
            isPurchasing={isBulkPurchasing}
            error={bulkPurchaseError}
          />
        )}

        {/* Select All Control (Top) */}
        {eligibleChapters.length > 0 && (
          <div className="mb-4 flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedChapterIds.size === eligibleChapters.length}
                onChange={handleSelectAllToggle}
                className="w-5 h-5 rounded border-border text-accent-primary focus:ring-accent-primary cursor-pointer"
                aria-label="Select all purchasable chapters"
              />
              <span className="text-sm font-medium text-text-primary">Select All</span>
            </label>
            <span className="text-xs text-text-tertiary">
              ({eligibleChapters.length} premium chapters available)
            </span>
          </div>
        )}

        {chapters.length > 0 ? (
          <div className="space-y-3">
            {chapters.map((chapter) => (
              <ChapterListItem
                key={chapter.id}
                chapter={chapter}
                bookSlug={book.id}
                isSelected={selectedChapterIds.has(chapter.id)}
                onToggle={handleChapterToggle}
                showCheckbox={!chapter.isFree && !chapter.purchased}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-bg-secondary rounded-xl border border-border">
            <p className="text-text-tertiary">No chapters available yet. Check back soon!</p>
          </div>
        )}

        {/* Select All Control (Bottom) - Only show if >10 chapters */}
        {showBottomSelectAll && eligibleChapters.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedChapterIds.size === eligibleChapters.length}
                onChange={handleSelectAllToggle}
                className="w-5 h-5 rounded border-border text-accent-primary focus:ring-accent-primary cursor-pointer"
                aria-label="Select all purchasable chapters"
              />
              <span className="text-sm font-medium text-text-primary">Select All</span>
            </label>
            <span className="text-xs text-text-tertiary">
              ({eligibleChapters.length} premium chapters available)
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
