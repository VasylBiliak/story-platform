import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getChapterBySlug, getChaptersByBook } from '@/lib/api/chapters';
import { getBookBySlug, getBooks } from '@/lib/api/books';
import { Paywall } from '@/components/chapter/Paywall';
import { LockIcon } from '@/components/ui/LockIcon';
import { BookOpenIcon } from '@/components/ui/BookOpenIcon';
import { chapters } from '@/data/chapters';
import { ChapterNavigation } from '@/components/chapterNavigation/ChapterNavigation';

type ChapterPageProps = {
  params: Promise<{
    bookSlug: string;
    chapterSlug: string;
  }>;
};

export async function generateStaticParams() {
  const books = await getBooks();
  const allParams: { bookSlug: string; chapterSlug: string }[] = [];

  for (const book of books) {
    const chapters = await getChaptersByBook(book.id);
    for (const chapter of chapters) {
      allParams.push({
        bookSlug: book.id,
        chapterSlug: chapter.slug,
      });
    }
  }

  return allParams;
}

export async function generateMetadata({
  params,
}: ChapterPageProps): Promise<Metadata> {
  const { bookSlug, chapterSlug } = await params;
  const chapter = await getChapterBySlug(bookSlug, chapterSlug);
  const book = chapter ? await getBookBySlug(chapter.bookId) : null;

  if (!chapter || !book) {
    return {
      title: 'Chapter Not Found - StoryPlatform',
    };
  }

  return {
    title: `${chapter.title} - ${book.title} - StoryPlatform`,
    description: `Read ${chapter.title} from ${book.title} by ${book.author}. ${chapter.isFree ? 'Free chapter available now.' : 'Premium chapter - purchase to read full content.'}`,
    openGraph: {
      title: `${chapter.title} - ${book.title}`,
      description: `Read ${chapter.title} from ${book.title} by ${book.author}`,
      type: 'article',
      authors: [book.author],
    },
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { bookSlug, chapterSlug } = await params;
  const chapter = await getChapterBySlug(bookSlug, chapterSlug);

  if (!chapter) {
    notFound();
  }

  const book = await getBookBySlug(chapter.bookId);

  if (!book) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-tertiary mb-8">
        <Link href="/" className="hover:text-accent-primary transition-colors">
          Home
        </Link>
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <Link
          href={`/book/${book.id}`}
          className="hover:text-text-primary transition-colors truncate max-w-xs"
        >
          {book.title}
        </Link>
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="text-text-primary truncate max-w-xs">{chapter.title}</span>
      </nav>

      {/* Chapter Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${chapter.isFree
              ? 'bg-status-success-bg text-status-success'
              : 'bg-status-warning-bg text-status-warning'
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
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
          {chapter.title}
        </h1>
        <p className="text-text-tertiary">
          From{' '}
          <Link
            href={`/book/${book.id}`}
            className="text-accent-primary hover:text-accent-primary-hover font-medium"
          >
            {book.title}
          </Link>{' '}
          by {book.author}
        </p>
      </header>

      {/* Chapter Content */}
      <article className="bg-bg-secondary rounded-xl border border-border overflow-hidden">
        {chapter.isFree ? (
          // Free chapter - show full content
          <div className="p-8 sm:p-12">
            <div className="prose prose-lg max-w-none">
              {chapter.content.split('\n\n').map((paragraph, index) => (
                <p
                  key={index}
                  className="text-text-secondary leading-relaxed mb-6 text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* End of chapter CTA */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="bg-accent-primary/10 rounded-lg p-6 text-center">
                <h3 className="font-semibold text-text-primary mb-2">
                  Enjoying the story?
                </h3>
                <p className="text-text-secondary mb-4">
                  Unlock premium chapters to continue reading.
                </p>
                <Link
                  href={`/book/${book.id}`}
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-accent-primary text-white font-medium rounded-lg hover:bg-accent-primary-hover transition-colors"
                >
                  View All Chapters
                </Link>
              </div>
            </div>
          </div>
        ) : (
          // Paid chapter - show paywall
          <Paywall chapter={chapter} />
        )}
      </article>
        <ChapterNavigation
          chapters={chapters}
          currentSlug={chapter.slug}
          bookId={book.id}
        />
      {/* Navigation */}
      <nav className="mt-8 flex items-center justify-between">

        <Link
          href={`/book/${book.id}`}
          className="inline-flex items-center text-text-secondary hover:text-text-primary font-medium transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Book
        </Link>
      </nav>
    </div>
  );
}
