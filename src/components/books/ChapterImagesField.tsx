"use client";

import { ChapterImage } from "@/types";
import { INPUT_LIMITS } from "@/lib/sanitize";
import { getChapterImage } from "@/lib/utils/imageHelpers";

interface ChapterImagesFieldProps {
  images: ChapterImage[];
  maxImages: number;
  onAdd: (files: FileList | null) => void;
  onRemove: (imageIndex: number) => void;
  onCaptionChange: (imageIndex: number, caption: string) => void;
}

export function ChapterImagesField({
  images,
  maxImages,
  onAdd,
  onRemove,
  onCaptionChange,
}: ChapterImagesFieldProps) {
  return (
    <div>
      <label className="block text-sm text-text-secondary mb-1">
        Chapter Images <span className="text-text-tertiary"></span>
      </label>
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-3">
          {images.map((img, i) => (
            <div key={i} className="space-y-2">
              <div className="relative group">
                <img src={getChapterImage(img.url)} alt={`Preview ${i + 1}`} className="w-full h-16 object-cover rounded-md border border-border" />
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-bg-primary/80 text-text-secondary hover:text-accent-primary rounded-full flex items-center justify-center text-xs transition"
                  title="Remove image"
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                value={img.caption ?? ""}
                onChange={(e) => onCaptionChange(i, e.target.value)}
                maxLength={INPUT_LIMITS.caption}
                placeholder="Enter caption..."
                className="w-full px-2 py-1 text-xs bg-bg-primary border border-border rounded text-text-primary outline-none focus:border-accent-primary transition"
              />
            </div>
          ))}
        </div>
      )}
      {images.length < maxImages && (
        <label className="block w-full px-3 py-2 border border-dashed border-border rounded-md text-text-secondary hover:border-accent-primary hover:text-text-primary transition cursor-pointer text-center text-sm">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={(e) => onAdd(e.target.files)}
          />
          + Upload images (max 3, 2MB each)
        </label>
      )}
    </div>
  );
}
