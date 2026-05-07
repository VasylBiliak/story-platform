export interface ParsedChapterImages {
  [chapterIndex: string]: File[];
}

export function parseChapterImages(formData: FormData): File[][] {
  const chapterImages: File[][] = [];
  const chapterMap = new Map<number, File[]>();

  // Pattern: chapterImages_{chapterIndex}_{imageIndex}
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("chapterImages_") && value instanceof File) {
      const match = key.match(/chapterImages_(\d+)_(\d+)/);
      if (match) {
        const chapterIndex = parseInt(match[1], 10);
        const imageIndex = parseInt(match[2], 10);

        if (!chapterMap.has(chapterIndex)) {
          chapterMap.set(chapterIndex, []);
        }
        const images = chapterMap.get(chapterIndex)!;
        images[imageIndex] = value;
      }
    }
  }

  const maxChapterIndex = Math.max(0, ...chapterMap.keys());
  for (let i = 0; i <= maxChapterIndex; i++) {
    chapterImages.push(chapterMap.get(i) || []);
  }

  return chapterImages;
}

export function validateFormData(formData: FormData): {
  valid: boolean;
  error?: string;
} {
  const bookData = formData.get("book");
  if (!bookData || typeof bookData !== "string") {
    return { valid: false, error: "Book data is required" };
  }

  try {
    JSON.parse(bookData);
  } catch {
    return { valid: false, error: "Invalid JSON in book data" };
  }

  return { valid: true };
}
