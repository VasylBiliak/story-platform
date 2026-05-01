import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBookBySlug, getBooks } from '@/lib/api/books';
import { getChaptersByBookSorted } from '@/lib/api/chapters';
import { ChapterListItem } from '@/components/chapter/ChapterListItem';

type BookPageProps = {
  params: Promise<{
    bookSlug: string;
  }>;
};

export async function generateStaticParams() {
  const books = await getBooks();
  return books.map((book) => ({
    bookSlug: book.id,
  }));
}

export async function generateMetadata(
  { params }: BookPageProps
): Promise<Metadata> {
  const { bookSlug } = await params;
  const book = await getBookBySlug(bookSlug);

  if (!book) {
    return {
      title: 'Book Not Found - StoryPlatform',
    };
  }

  return {
    title: `${book.title} by ${book.author} - StoryPlatform`,
    description: book.description,
    openGraph: {
      title: book.title,
      description: book.description,
      type: 'book',
      authors: [book.author],
      images: [
        {
          url: book.cover,
          width: 400,
          height: 600,
          alt: `Cover of ${book.title}`,
        },
      ],
    },
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const { bookSlug } = await params;
  const book = await getBookBySlug(bookSlug);

  if (!book) {
    notFound();
  }

  const chapters = await getChaptersByBookSorted(book.id);
  const freeChapters = chapters.filter((c) => c.isFree).length;
  const paidChapters = chapters.filter((c) => !c.isFree).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-8">
        <Link href="/" className="hover:text-accent-color transition-colors">
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
        <span className="text-text-primary truncate max-w-xs">{book.title}</span>
      </nav>

      {/* Book Header */}
      <div className=" rounded-2xl shadow-sm border border-border overflow-hidden mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
          {/* Cover Image */}
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

          {/* Book Info */}
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
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-status-success-bg text-status-success">
                {freeChapters} Free Chapter{freeChapters !== 1 ? 's' : ''}
              </span>
              {paidChapters > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-status-warning-bg text-status-warning">
                  {paidChapters} Premium Chapter{paidChapters !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Chapters</h2>
          <span className="text-sm text-text-tertiary">
            {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}
          </span>
        </div>

        {chapters.length > 0 ? (
          <div className="space-y-3">
            {chapters.map((chapter) => (
              <ChapterListItem
                key={chapter.id}
                chapter={chapter}
                bookSlug={book.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-bg-secondary rounded-xl border border-border">
            <p className="text-text-tertiary">
              No chapters available yet. Check back soon!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
