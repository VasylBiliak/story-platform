import Link from 'next/link';
import { Chapter } from '@/lib/types';
import { LockIcon } from '@/components/ui/LockIcon';
import { BookOpenIcon } from '@/components/ui/BookOpenIcon';

interface ChapterListItemProps {
  chapter: Chapter;
  bookSlug: string;
}

export function ChapterListItem({ chapter, bookSlug }: ChapterListItemProps) {
  return (
    <Link
      href={`/book/${bookSlug}/chapter/${chapter.slug}`}
      className="group flex items-center justify-between p-4 rounded-lg border border-border
      transition-all duration-200 hover:border-border-hover hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            chapter.isFree
              ? 'bg-status-success-bg text-status-success'
              : 'bg-status-warning-bg text-status-warning'
          }`}
        >
          {chapter.isFree ? (
            <BookOpenIcon className="w-5 h-5" />
          ) : (
            <LockIcon className="w-5 h-5" />
          )}
        </div>
        <div>
          <h3 className="font-medium group-hover:text-accent-primary transition-colors">
            {chapter.title}
          </h3>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              chapter.isFree
                ? 'bg-status-success-bg text-status-success'
                : 'bg-status-warning-bg text-status-warning'
            }`}
          >
            {chapter.isFree ? 'FREE' : 'LOCKED'}
          </span>
        </div>
      </div>
      {!chapter.isFree && chapter.price && (
        <span className="text-sm font-semibold">
          ${chapter.price.toFixed(2)}
        </span>
      )}
    </Link>
  );
}
