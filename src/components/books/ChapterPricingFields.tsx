"use client";

import type { ChapterInput, ChapterFieldValue } from "@/lib/hooks/useBookForm";

interface ChapterPricingFieldsProps {
  chapter: ChapterInput;
  /** The first chapter is always free, so it has no free toggle */
  showFreeToggle: boolean;
  onChange: (field: keyof ChapterInput, value: ChapterFieldValue) => void;
}

export function ChapterPricingFields({ chapter, showFreeToggle, onChange }: ChapterPricingFieldsProps) {
  return (
    <>
      {showFreeToggle && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={chapter.isFree}
            onChange={(e) => {
              onChange("isFree", e.target.checked);
              // When setting isFree, also update price accordingly
              if (e.target.checked) {
                onChange("price", 0);
              }
            }}
            className="w-4 h-4 accent-accent-primary"
          />
          <span className="text-sm text-text-secondary">
            Free chapter
          </span>
          {chapter.isFree && (
            <span className="text-xs text-accent-primary ml-2">(Price set to 0)</span>
          )}
        </label>
      )}

      {!chapter.isFree && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Price (USD) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={chapter.price ?? ""}
              onChange={(e) => onChange("price", e.target.value)}
              className="w-full px-3 py-2 bg-bg-primary border border-border rounded-md text-text-primary outline-none focus:border-accent-primary transition"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">
              Discount (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={chapter.discount ?? ""}
              onChange={(e) => onChange("discount", e.target.value)}
              disabled={chapter.isFree}
              className={`w-full px-3 py-2 bg-bg-primary border rounded-md text-text-primary outline-none focus:border-accent-primary transition ${chapter.discountError ? 'border-red-500' : 'border-border'
                } ${chapter.isFree ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="0"
            />
            {chapter.discountError && (
              <p className="text-xs text-red-500 mt-1">{chapter.discountError}</p>
            )}
          </div>
        </div>
      )}

      {chapter.price !== undefined && chapter.price !== 0 && (
        <div className="p-3 bg-bg-secondary rounded-lg border border-border">
          <p className="text-sm text-text-secondary">
            Base Price:{" "}
            <span className="font-semibold text-accent-primary">
              ${chapter.price.toFixed(2)}
            </span>
            {chapter.discount && chapter.discount > 0 && (
              <>
                {" "}
                <span className="ml-2 text-text-tertiary">
                  -{chapter.discount}% discount
                </span>
              </>
            )}
            <span className="text-xs text-text-tertiary ml-2">
              (Final price calculated by backend)
            </span>
          </p>
        </div>
      )}
    </>
  );
}
