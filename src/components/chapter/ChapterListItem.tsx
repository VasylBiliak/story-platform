import Link from "next/link";
import { Chapter } from "@/lib/types";
import { LockIcon } from "@/components/ui/LockIcon";
import { BookOpenIcon } from "@/components/ui/BookOpenIcon";
import { PurchasedBadge } from "./PurchasedBadge";
import { getChapterImage } from "@/lib/utils/imageHelpers";

interface ChapterListItemProps {
  chapter: Chapter;
  bookSlug: string;
  isSelected?: boolean;
  onToggle?: (chapterId: string) => void;
  showCheckbox?: boolean;
}

export function ChapterListItem({ chapter, bookSlug, isSelected = false, onToggle, showCheckbox = false }: ChapterListItemProps) {
  const firstImage = chapter.images?.[0];
  const imageUrl = getChapterImage(firstImage?.url);

  const content = (
    <>
      <div className="flex items-center gap-3">
        {showCheckbox && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle?.(chapter.id)}
            className="w-5 h-5 rounded border-border text-accent-primary focus:ring-accent-primary cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        )}
        
        <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden border border-border">
          <img
            src={imageUrl}
            alt={firstImage?.caption || chapter.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            chapter.isFree
              ? "bg-status-success-bg text-status-success"
              : "bg-status-warning-bg text-status-warning"
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

          {chapter.purchased ? (
            <PurchasedBadge />
          ) : (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                chapter.isFree
                  ? "bg-status-success-bg text-status-success"
                  : "bg-status-warning-bg text-status-warning"
              }`}
            >
              {chapter.isFree ? "FREE" : "LOCKED"}
            </span>
          )}
        </div>
      </div>

      {!chapter.isFree && !chapter.purchased && chapter.finalPrice !== undefined && (
        <div className="text-right">
          <div className="text-sm font-semibold text-accent-primary">
            ${chapter.finalPrice.toFixed(2)}
          </div>

          {chapter.discount && chapter.discount > 0 && chapter.price && (
            <div className="text-xs text-text-tertiary">
              <span className="line-through">
                ${chapter.price.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );

  if (showCheckbox) {
    return (
      <div className="group flex items-center justify-between p-4 rounded-lg border border-border
      transition-all duration-200 hover:border-accent-primary-hover hover:shadow-sm cursor-pointer"
      onClick={() => onToggle?.(chapter.id)}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/book/${bookSlug}/chapter/${chapter.slug}`}
      className="group flex items-center justify-between p-4 rounded-lg border border-border
      transition-all duration-200 hover:border-accent-primary-hover hover:shadow-sm"
    >
      {content}
    </Link>
  );
}