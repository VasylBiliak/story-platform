"use client";

import { useState } from "react";
import type { ChapterImage } from "@/types";
import { getChapterImage } from "@/lib/utils/imageHelpers";

interface ChapterImagesProps {
  images: ChapterImage[];
}

export default function ChapterImages({ images }: ChapterImagesProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  if (!images || images.length === 0) {
    return null;
  }

  const getImageKey = (image: ChapterImage, index: number): string => {
    return (image as any).id || image.url || index.toString();
  };

  const handleImageLoad = (imageKey: string) => {
    setLoadedImages((prev) => new Set(prev).add(imageKey));
  };

  const handleImageError = (imageKey: string) => {
    setLoadedImages((prev) => {
      const next = new Set(prev);
      next.delete(imageKey);
      return next;
    });
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Chapter Images</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => {
          const imageKey = getImageKey(image, index);
          const imageUrl = getChapterImage(image.url);
          return (
            <figure
              key={imageKey}
              className="space-y-2"
            >
              <div className="relative aspect-video bg-bg-tertiary rounded-lg overflow-hidden border border-border">
                <img
                  src={imageUrl}
                  alt={image.caption || "Chapter image"}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    loadedImages.has(imageKey) ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => handleImageLoad(imageKey)}
                  onError={() => handleImageError(imageKey)}
                  loading="lazy"
                />
                {!loadedImages.has(imageKey) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-border border-t-accent-primary rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {image.caption && (
                <figcaption className="text-sm text-text-secondary text-center">
                  {image.caption}
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>
    </div>
  );
}
