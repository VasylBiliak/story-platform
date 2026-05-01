import Image from 'next/image';
import Link from 'next/link';
import { Book } from '@/lib/types';

type ExtendedBook = Book & { isLocal?: boolean };

interface BookCardProps {
  book: ExtendedBook;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link
      href={`/book/${book.id}`}
      className={`group block rounded-xl shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        book.isLocal ? 'border-dashed border-accent-primary/50' : 'border-border'
      }`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <Image
          src={book.cover}
          alt={`Cover of ${book.title}`}
          fill
          className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
            book.isLocal ? 'opacity-90' : ''
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {book.isLocal && (
          <div className="absolute top-2 right-2">
            <span className="inline-block text-xs font-semibold px-2 py-1 rounded-md border border-accent-primary text-accent-primary bg-bg-primary/80 backdrop-blur-sm">
              Not Public
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h2 className="text-lg font-bold text-text-primary mb-2 line-clamp-1 
        group-hover:text-accent-primary transition-colors">
          {book.title}
        </h2>
        <p className="text-sm text-text-secondary mb-3">{book.author}</p>
        <p className="text-sm text-text-tertiary line-clamp-2 leading-relaxed">
          {book.description}
        </p>
        <div className="mt-4 flex items-center text-accent-primary text-sm font-medium">
          <span>Read Now</span>
          <svg
            className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
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
        </div>
      </div>
    </Link>
  );
}
