/**
 * Helpers that turn BookForm state into the payloads the books API expects
 */

import { validateImage } from "@/lib/sanitize";
import type { BookFormState } from "@/lib/hooks/useBookForm";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const validation = validateImage(file);
    if (!validation.valid) {
      reject(new Error(validation.error));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function buildBookPayload(form: BookFormState, author: string) {
  return {
    title: (form.book.title ?? '').trim(),
    description: (form.book.description ?? '').trim(),
    cover: (form.book.cover ?? '').trim(),
    author,
    genres: form.book.genres,
    chapters: form.chapters.map((c, i) => ({
      ...(c.id && { id: c.id }), // CRITICAL: Send chapter.id for existing chapters only
      title: (c.title ?? '').trim(),
      slug: slugify(c.title ?? '') || `chapter-${i + 1}`,
      content: (c.content ?? '').trim(),
      isFree: c.isFree,
      price: c.isFree ? 0 : (c.price ?? 0),
      discount: c.isFree ? 0 : (c.discount ?? 0),
      tags: c.tags,
      images: c.images.map((img) => ({
        ...(img.id && { id: img.id }), // CRITICAL: Send image.id for existing images only
        url: img.url,
        caption: (img.caption ?? '').trim() || "",
      })),
    })),
  };
}

/**
 * Newly added chapter images are held as data URLs; upload them as files
 * under the `chapterImages_<chapter>_<image>` keys the API reads
 */
export function appendChapterImageFiles(formData: FormData, chapters: BookFormState["chapters"]) {
  chapters.forEach((chapter, chapterIndex) => {
    chapter.images.forEach((image, imageIndex) => {
      if (image.url.startsWith("data:")) {
        const base64Data = image.url.split(",")[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers as unknown as ArrayLike<number>);
        const blob = new Blob([byteArray], { type: "image/jpeg" });
        const file = new File([blob], `chapter-${chapterIndex}-image-${imageIndex}.jpg`, { type: "image/jpeg" });
        formData.append(`chapterImages_${chapterIndex}_${imageIndex}`, file);
      }
    });
  });
}
