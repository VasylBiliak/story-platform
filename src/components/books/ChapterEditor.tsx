"use client";

import { Ref } from "react";
import { INPUT_LIMITS } from "@/lib/sanitize";
import { CHAPTER_TAGS, MAX_TAGS_PER_CHAPTER } from "@/lib/constants/tags";
import { MAX_IMAGES_PER_CHAPTER } from "@/lib/hooks/useBookForm";
import type { ChapterInput, ChapterFieldValue } from "@/lib/hooks/useBookForm";
import { FilterDropdown } from "./FilterDropdown";
import { SelectedValues } from "./SelectedValues";
import { ChapterImagesField } from "./ChapterImagesField";
import { ChapterPricingFields } from "./ChapterPricingFields";

interface ChapterEditorProps {
  chapter: ChapterInput;
  index: number;
  canRemove: boolean;
  titleRef?: Ref<HTMLInputElement>;
  onChange: (field: keyof ChapterInput, value: ChapterFieldValue) => void;
  onRemove: () => void;
  onToggleTag: (tag: string) => void;
  onAddImages: (files: FileList | null) => void;
  onRemoveImage: (imageIndex: number) => void;
  onImageCaptionChange: (imageIndex: number, caption: string) => void;
}

export function ChapterEditor({
  chapter,
  index,
  canRemove,
  titleRef,
  onChange,
  onRemove,
  onToggleTag,
  onAddImages,
  onRemoveImage,
  onImageCaptionChange,
}: ChapterEditorProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h4 className="text-text-primary font-semibold">
          Chapter {index + 1}
        </h4>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 text-xs text-text-tertiary hover:text-accent-primary transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="hidden md:inline ml-2">Remove</span>
          </button>
        )}
      </div>

      <div>
        <label
          htmlFor={`chapter-title-${index}`}
          className="block text-sm text-text-secondary mb-1"
        >
          Title *
        </label>
        <input
          id={`chapter-title-${index}`}
          type="text"
          ref={titleRef}
          value={chapter.title}
          onChange={(e) => onChange("title", e.target.value)}
          maxLength={INPUT_LIMITS.chapterTitle}
          className="w-full px-3 py-2 bg-bg-primary border border-border rounded-md text-text-primary outline-none focus:border-accent-primary transition"
          placeholder="Chapter title"
        />
      </div>

      <div>
        <label
          htmlFor={`chapter-content-${index}`}
          className="block text-sm text-text-secondary mb-1"
        >
          Content *
        </label>
        <textarea
          id={`chapter-content-${index}`}
          value={chapter.content}
          onChange={(e) => onChange("content", e.target.value)}
          maxLength={INPUT_LIMITS.chapterContent}
          className="w-full px-3 py-2 bg-bg-primary border border-border rounded-md text-text-primary outline-none focus:border-accent-primary transition min-h-25"
          placeholder="Chapter content"
        />
      </div>

      <ChapterImagesField
        images={chapter.images}
        maxImages={MAX_IMAGES_PER_CHAPTER}
        onAdd={onAddImages}
        onRemove={onRemoveImage}
        onCaptionChange={onImageCaptionChange}
      />

      <div>
        <FilterDropdown
          label="Tags"
          options={CHAPTER_TAGS}
          selected={chapter.tags}
          onToggle={onToggleTag}
          onClear={() => onChange("tags", [])}
          maxSelections={MAX_TAGS_PER_CHAPTER}
        />
        <SelectedValues values={chapter.tags} />
      </div>

      <ChapterPricingFields
        chapter={chapter}
        showFreeToggle={index !== 0}
        onChange={onChange}
      />
    </>
  );
}
