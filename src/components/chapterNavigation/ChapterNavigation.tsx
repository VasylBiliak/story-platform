'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Chapter = {
  id: string;
  slug: string;
  title: string;
  bookId?: string;
};

type Props = {
  chapters: Chapter[];
  currentSlug: string;
  bookId: string;
};

type PageItem = number | 'ellipsis';

function getVisiblePages(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const set = new Set<PageItem>();
  const range = 2;

  set.add(1);

  if (current > range + 2) {
    set.add('ellipsis');
  } else if (current === range + 2) {
    set.add(2);
  }

  const start = Math.max(2, current - range);
  const end = Math.min(total - 1, current + range);

  for (let i = start; i <= end; i++) {
    set.add(i);
  }

  if (current < total - range - 1) {
    set.add('ellipsis');
  } else if (current === total - range - 1) {
    set.add(total - 1);
  }

  set.add(total);

  return Array.from(set);
}

const NavButton = ({
  href,
  disabled,
  children,
}: {
  href?: string;
  disabled?: boolean;
  children: React.ReactNode;
}) => {
  const base =
    'px-4 py-2 border rounded-lg inline-flex items-center gap-1 transition';

  const styles = disabled
    ? 'border-border text-text-tertiary/50 cursor-not-allowed pointer-events-none'
    : 'border-border text-text-secondary hover:text-text-primary hover:border-border-hover';

  if (disabled || !href) {
    return <span className={`${base} ${styles}`}>{children}</span>;
  }

  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
};

export function ChapterNavigation({ chapters, currentSlug, bookId }: Props) {
  const router = useRouter();

  const bookChapters = chapters
    .filter((c) => !c.bookId || c.bookId === bookId)
    .sort((a, b) => {
      const numA = Number(a.id.split('-').pop());
      const numB = Number(b.id.split('-').pop());
      return numA - numB;
    });

  const currentIndex = bookChapters.findIndex((c) => c.slug === currentSlug);

  if (currentIndex === -1 || bookChapters.length === 0) return null;

  const currentNumber = currentIndex + 1;
  const totalChapters = bookChapters.length;

  const prevChapter = bookChapters[currentIndex - 1];
  const nextChapter = bookChapters[currentIndex + 1];

  const visiblePages = getVisiblePages(currentNumber, totalChapters);

  const handleJump = (value: number) => {
    if (!Number.isInteger(value)) return;
    if (value < 1 || value > totalChapters) return;

    const target = bookChapters[value - 1];
    if (target) {
      router.push(`/book/${bookId}/chapter/${target.slug}`);
    }
  };

  const baseLinkClass =
    'px-3 py-1.5 text-sm rounded-md border border-border hover:text-accent-primary hover:border-accent-primary transition';

  const activeLinkClass =
    'px-3 py-1.5 text-sm rounded-md border border-accent-primary text-accent-primary font-medium';

  return (
    <div className="mt-4 mb-4 bg-bg-secondary border border-border rounded-xl p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <NavButton
            href={`/book/${bookId}/chapter/${prevChapter?.slug}`}
            disabled={!prevChapter}
          >
            <span>←</span>
            <span className="hidden sm:inline text-text-primary">Prev</span>
          </NavButton>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {visiblePages.map((item, idx) => {
            if (item === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1.5 text-sm text-text-tertiary select-none"
                >
                            {totalChapters > 5 && (
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="..."
              className="w-12 px-1 py-1.5 bg-bg-primary border border-border rounded-md text-center text-sm text-text-primary outline-none focus:border-accent-primary transition"
              onChange={(e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = Number((e.target as HTMLInputElement).value);
                  handleJump(value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
          )}
                </span>
              );
            }

            const chapter = bookChapters[item - 1];
            const isCurrent = item === currentNumber;

            return (
              <Link
                key={chapter.slug}
                href={`/book/${bookId}/chapter/${chapter.slug}`}
                className={isCurrent ? activeLinkClass : baseLinkClass}
                aria-current={isCurrent ? 'page' : undefined}
                title={chapter.title}
              >
                {item}
              </Link>
            );
          })}


        </div>

        <div>
          <NavButton
            href={`/book/${bookId}/chapter/${nextChapter?.slug}`}
            disabled={!nextChapter}
          >
            <span className="hidden sm:inline">Next</span>
            <span>→</span>
          </NavButton>
        </div>
      </div>
    </div>
  );
}

export default ChapterNavigation;