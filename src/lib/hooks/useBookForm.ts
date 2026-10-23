/**
 * useBookForm hook
 * Owns BookForm state: book fields, genres, chapters, chapter tags and images, and validation
 */

import { useState, useRef } from "react";
import { Book, Chapter, ChapterImage } from "@/types";
import { sanitizeText, INPUT_LIMITS } from "@/lib/sanitize";
import { MAX_GENRES_PER_BOOK } from "@/lib/constants/genres";
import { MAX_TAGS_PER_CHAPTER } from "@/lib/constants/tags";
import { fileToBase64 } from "@/lib/utils/bookFormPayload";

export const MAX_CHAPTERS_PER_FORM = 5;
export const MAX_IMAGES_PER_CHAPTER = 3;

export type ChapterInput = {
  id?: string; // Add optional id for existing chapters
  title: string;
  content: string;
  isFree: boolean;
  price?: number;
  discount?: number;
  tags: string[];
  images: ChapterImage[];
  discountError?: string;
};

export type BookFormState = {
  book: {
    title: string;
    description: string;
    cover: string;
    genres: string[];
  };
  chapters: ChapterInput[];
};

export type ChapterFieldValue = string | boolean | number | string[];

export function createInitialState(book?: Book, chapters?: Chapter[]): BookFormState {
  if (book && chapters) {
    return {
      book: {
        title: book.title ?? '',
        description: book.description ?? '',
        cover: book.cover ?? '',
        genres: book.genres ?? [],
      },
      chapters: chapters.map((c) => ({
        title: c.title ?? '',
        content: c.content ?? '',
        isFree: c.isFree,
        price: c.price,
        discount: c.discount,
        tags: c.tags ?? [],
        images: c.images || [],
      })),
    };
  }
  return {
    book: {
      title: "",
      description: "",
      cover: "",
      genres: [],
    },
    chapters: [{ title: "", content: "", isFree: true, tags: [], images: [] }],
  };
}

function isFormValid(form: BookFormState): boolean {
  return (
    form.book.title.trim().length > 0 &&
    form.book.title.trim().length <= INPUT_LIMITS.bookTitle &&
    form.book.description.trim().length <= INPUT_LIMITS.description &&
    (form.book.cover ?? '').trim().length > 0 &&
    form.chapters.length >= 1 &&
    form.chapters.every(
      (c) =>
        (c.title ?? '').trim().length > 0 &&
        (c.title ?? '').trim().length <= INPUT_LIMITS.chapterTitle &&
        (c.content ?? '').trim().length > 0 &&
        (c.content ?? '').trim().length <= INPUT_LIMITS.chapterContent &&
        (c.isFree || (c.price !== undefined && c.price >= 0)) &&
        (c.discount === undefined || (Number.isInteger(c.discount) && c.discount >= 0 && c.discount <= 100)) &&
        !c.discountError &&
        c.images.every(
          (img) => (img.caption?.trim().length ?? 0) <= INPUT_LIMITS.caption
        )
    )
  );
}

export function useBookForm(initialBook?: Book, initialChapters?: Chapter[]) {
  const [form, setForm] = useState<BookFormState>(() =>
    createInitialState(initialBook, initialChapters)
  );
  const pendingFocusIndex = useRef<number | null>(null);

  const resetForm = () => setForm(createInitialState());

  const updateBook = (field: keyof BookFormState["book"], value: string | string[]) => {
    if (field === "genres") {
      setForm((prev) => ({
        ...prev,
        book: { ...prev.book, genres: value as string[] },
      }));
    } else {
      const sanitized = sanitizeText(value as string);
      setForm((prev) => ({
        ...prev,
        book: { ...prev.book, [field]: sanitized },
      }));
    }
  };

  const setCover = (cover: string) => {
    setForm((prev) => ({ ...prev, book: { ...prev.book, cover } }));
  };

  const toggleGenre = (genre: string) => {
    const currentGenres = form.book.genres;
    if (currentGenres.includes(genre)) {
      updateBook("genres", currentGenres.filter(g => g !== genre));
    } else if (currentGenres.length < MAX_GENRES_PER_BOOK) {
      updateBook("genres", [...currentGenres, genre]);
    }
  };

  const updateChapter = (
    index: number,
    field: keyof ChapterInput,
    value: ChapterFieldValue
  ) => {
    let safeValue: ChapterFieldValue | undefined;
    if (typeof value === "string") {
      if (field === "price" || field === "discount") {
        safeValue = value === "" ? undefined : parseFloat(value);
      } else {
        safeValue = sanitizeText(value);
      }
    } else {
      safeValue = value;
    }
    setForm((prev) => {
      const next = [...prev.chapters];
      next[index] = { ...next[index], [field]: safeValue };

      // Reactive free chapter logic: if price is 0, set isFree to true
      if (field === "price" && typeof safeValue === "number") {
        if (safeValue === 0) {
          next[index].isFree = true;
        } else if (safeValue > 0 && next[index].isFree) {
          next[index].isFree = false;
        }
      }

      // Validate discount: must be between 0 and 100
      if (field === "discount" && typeof safeValue === "number") {
        if (safeValue < 0 || safeValue > 100) {
          next[index].discountError = "Discount must be between 0 and 100";
        } else {
          next[index].discountError = undefined;
        }
      }

      // Free chapters cannot have discount > 0
      if (next[index].isFree && next[index].discount && next[index].discount > 0) {
        next[index].discount = 0;
      }

      return { ...prev, chapters: next };
    });
  };

  const toggleTag = (chapterIndex: number, tag: string) => {
    const currentTags = form.chapters[chapterIndex].tags;
    if (currentTags.includes(tag)) {
      updateChapter(chapterIndex, "tags", currentTags.filter(t => t !== tag));
    } else if (currentTags.length < MAX_TAGS_PER_CHAPTER) {
      updateChapter(chapterIndex, "tags", [...currentTags, tag]);
    }
  };

  const addChapter = () => {
    if (form.chapters.length >= MAX_CHAPTERS_PER_FORM) return;
    pendingFocusIndex.current = form.chapters.length;
    setForm((prev) => ({
      ...prev,
      chapters: [...prev.chapters, { title: "", content: "", isFree: false, tags: [], images: [] }],
    }));
  };

  // Focuses a newly added chapter's title input as soon as it mounts
  const chapterTitleRef = (index: number) => (input: HTMLInputElement | null) => {
    if (input && pendingFocusIndex.current === index) {
      input.focus();
      pendingFocusIndex.current = null;
    }
  };

  const removeChapter = (index: number) => {
    if (form.chapters.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      chapters: prev.chapters.filter((_, i) => i !== index),
    }));
  };

  const addChapterImages = async (chapterIndex: number, files: FileList | null) => {
    if (!files) return;
    const chapter = form.chapters[chapterIndex];
    const remainingSlots = MAX_IMAGES_PER_CHAPTER - chapter.images.length;
    if (remainingSlots <= 0) return;
    const toProcess = Array.from(files).slice(0, remainingSlots);
    try {
      const base64s = await Promise.all(toProcess.map(fileToBase64));
      const newImages: ChapterImage[] = base64s.map((url) => ({ id: crypto.randomUUID(), url, caption: "" }));
      setForm((prev) => {
        const next = [...prev.chapters];
        next[chapterIndex] = { ...next[chapterIndex], images: [...next[chapterIndex].images, ...newImages] };
        return { ...prev, chapters: next };
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to process image");
    }
  };

  const removeChapterImage = (chapterIndex: number, imageIndex: number) => {
    setForm((prev) => {
      const next = [...prev.chapters];
      next[chapterIndex] = {
        ...next[chapterIndex],
        images: next[chapterIndex].images.filter((_, i) => i !== imageIndex),
      };
      return { ...prev, chapters: next };
    });
  };

  const updateChapterImageCaption = (chapterIndex: number, imageIndex: number, caption: string) => {
    const sanitized = sanitizeText(caption);
    setForm((prev) => {
      const next = [...prev.chapters];
      const updatedImages = [...next[chapterIndex].images];
      updatedImages[imageIndex] = { ...updatedImages[imageIndex], caption: sanitized };
      next[chapterIndex] = { ...next[chapterIndex], images: updatedImages };
      return { ...prev, chapters: next };
    });
  };

  return {
    form,
    isValid: isFormValid(form),
    resetForm,
    updateBook,
    setCover,
    toggleGenre,
    updateChapter,
    toggleTag,
    addChapter,
    removeChapter,
    addChapterImages,
    removeChapterImage,
    updateChapterImageCaption,
    chapterTitleRef,
  };
}
