"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Chapter, ChapterImage } from "@/types";
import { DEFAULT_IMG } from "@/data/books";

interface Props {
  onCreate: (book: Book, chapters: Chapter[]) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

type ChapterInput = {
  title: string;
  content: string;
  isFree: boolean;
  images: ChapterImage[];
};

type FormState = {
  book: {
    title: string;
    description: string;
    cover: string;
    author: string;
    images: string[];
  };
  chapters: ChapterInput[];
};

const INITIAL_STATE: FormState = {
  book: {
    title: "",
    description: "",
    cover: "",
    author: "",
    images: [],
  },
  chapters: [{ title: "", content: "", isFree: true, images: [] }],
};

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error("File exceeds 2MB limit"));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function CreateBookWithChaptersForm({ onCreate }: Props) {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const lastInputRef = useRef<HTMLInputElement | null>(null);
  const [lastAddedIndex, setLastAddedIndex] = useState<number | null>(null);

  const updateBook = (field: keyof FormState["book"], value: string) => {
    setForm((prev) => ({
      ...prev,
      book: { ...prev.book, [field]: value },
    }));
  };

  const updateChapter = (
    index: number,
    field: keyof ChapterInput,
    value: string | boolean
  ) => {
    setForm((prev) => {
      const next = [...prev.chapters];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, chapters: next };
    });
  };

  const addChapter = () => {
    if (form.chapters.length >= 5) return;
    setLastAddedIndex(form.chapters.length);
    setForm((prev) => ({
      ...prev,
      chapters: [...prev.chapters, { title: "", content: "", isFree: false, images: [] }],
    }));
  };

  useEffect(() => {
    if (lastAddedIndex !== null && lastInputRef.current) {
      lastInputRef.current.focus();
      setLastAddedIndex(null);
    }
  }, [lastAddedIndex]);

  const removeChapter = (index: number) => {
    if (form.chapters.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      chapters: prev.chapters.filter((_, i) => i !== index),
    }));
  };

  const handleBookCover = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      const base64 = await fileToBase64(file);
      setForm((prev) => ({
        ...prev,
        book: { ...prev.book, cover: base64 },
      }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to process image");
    }
  };

  const removeBookCover = () => {
    setForm((prev) => ({
      ...prev,
      book: { ...prev.book, cover: "" },
    }));
  };

  const handleChapterImages = async (chapterIndex: number, files: FileList | null) => {
    if (!files) return;
    const chapter = form.chapters[chapterIndex];
    const remainingSlots = 3 - chapter.images.length;
    if (remainingSlots <= 0) return;
    const toProcess = Array.from(files).slice(0, remainingSlots);
    try {
      const base64s = await Promise.all(toProcess.map(fileToBase64));
      const newImages: ChapterImage[] = base64s.map((url) => ({ url, caption: "" }));
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
    setForm((prev) => {
      const next = [...prev.chapters];
      const updatedImages = [...next[chapterIndex].images];
      updatedImages[imageIndex] = { ...updatedImages[imageIndex], caption };
      next[chapterIndex] = { ...next[chapterIndex], images: updatedImages };
      return { ...prev, chapters: next };
    });
  };

  const isValid =
    form.book.title.trim().length > 0 &&
    form.book.author.trim().length > 0 &&
    form.book.cover.trim().length > 0 &&
    form.chapters.every(
      (c) => c.title.trim().length > 0 && c.content.trim().length > 0
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const bookId = `${slugify(form.book.title)}-${Date.now()}`;

    const newBook: Book = {
      id: bookId,
      title: form.book.title.trim(),
      description: form.book.description.trim(),
      cover: form.book.cover.trim(),
      author: form.book.author.trim(),
    };

    const newChapters: Chapter[] = form.chapters.map((c, i) => ({
      id: `${bookId}-${i + 1}`,
      bookId,
      title: c.title.trim(),
      slug: slugify(c.title) || `chapter-${i + 1}`,
      content: c.content.trim(),
      isFree: i === 0 ? true : c.isFree,
      images: c.images.length > 0 
        ? c.images.map(img => ({ ...img, caption: img.caption.trim() }))
        : undefined,
    }));

    onCreate(newBook, newChapters);
    setForm(INITIAL_STATE);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Book Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-text-primary">Book Details</h3>

        <div>
          <label htmlFor="book-title" className="block text-sm text-text-secondary mb-1">
            Title *
          </label>
          <input
            id="book-title"
            type="text"
            value={form.book.title}
            onChange={(e) => updateBook("title", e.target.value)}
            className="w-full px-3 py-2 bg-bg-primary border border-border rounded-md text-text-primary outline-none focus:border-accent-primary transition"
            placeholder="Book title"
          />
        </div>

        <div>
          <label htmlFor="book-author" className="block text-sm text-text-secondary mb-1">
            Author *
          </label>
          <input
            id="book-author"
            type="text"
            value={form.book.author}
            onChange={(e) => updateBook("author", e.target.value)}
            className="w-full px-3 py-2 bg-bg-primary border border-border rounded-md text-text-primary outline-none focus:border-accent-primary transition"
            placeholder="Author name"
          />
        </div>

        <div>
          <label htmlFor="book-description" className="block text-sm text-text-secondary mb-1">
            Description
          </label>
          <textarea
            id="book-description"
            value={form.book.description}
            onChange={(e) => updateBook("description", e.target.value)}
            className="w-full px-3 py-2 bg-bg-primary border border-border rounded-md text-text-primary outline-none focus:border-accent-primary transition min-h-[80px]"
            placeholder="Book description"
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">
            Cover Image <span className="text-text-tertiary">(1 required, 2MB max)</span>
          </label>
          {form.book.cover ? (
            <div className="relative inline-block mb-3">
              <img
                src={form.book.cover}
                alt="Book cover preview"
                className="w-24 h-32 object-cover rounded-md border border-border"
              />
              <button
                type="button"
                onClick={removeBookCover}
                className="absolute top-1 right-1 w-6 h-6 bg-bg-primary/90 text-text-secondary hover:text-accent-primary rounded-full flex items-center justify-center text-sm transition"
                title="Remove cover"
              >
                ×
              </button>
            </div>
          ) : (
            <label className="block w-full px-3 py-3 border border-dashed border-border rounded-md text-text-secondary hover:border-accent-primary hover:text-text-primary transition cursor-pointer text-center text-sm">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleBookCover(e.target.files)}
              />
              + Upload cover image
            </label>
          )}
        </div>
      </div>

      {/* Chapters Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-text-primary">Chapters</h3>

        <AnimatePresence mode="popLayout">
          {form.chapters.map((chapter, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
              transition={{ duration: 0.2 }}
              className="p-4 border border-border rounded-lg space-y-3 overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-text-primary font-semibold">
                  Chapter {index + 1}
                </h4>
                {form.chapters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeChapter(index)}
                    className="text-xs text-text-tertiary hover:text-accent-primary transition"
                  >
                    Remove Chapter
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
                  ref={lastAddedIndex === index ? lastInputRef : undefined}
                  value={chapter.title}
                  onChange={(e) =>
                    updateChapter(index, "title", e.target.value)
                  }
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
                  onChange={(e) =>
                    updateChapter(index, "content", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-bg-primary border border-border rounded-md text-text-primary outline-none focus:border-accent-primary transition min-h-[100px]"
                  placeholder="Chapter content"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  Chapter Images <span className="text-text-tertiary">(up to 3)</span>
                </label>
                {chapter.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {chapter.images.map((img, i) => (
                      <div key={i} className="space-y-2">
                        <div className="relative group">
                          <img src={img.url} alt={`Preview ${i + 1}`} className="w-full h-16 object-cover rounded-md border border-border" />
                          <button
                            type="button"
                            onClick={() => removeChapterImage(index, i)}
                            className="absolute top-1 right-1 w-5 h-5 bg-bg-primary/80 text-text-secondary hover:text-accent-primary rounded-full flex items-center justify-center text-xs transition"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                        <input
                          type="text"
                          value={img.caption}
                          onChange={(e) => updateChapterImageCaption(index, i, e.target.value)}
                          placeholder="Enter caption..."
                          className="w-full px-2 py-1 text-xs bg-bg-primary border border-border rounded text-text-primary outline-none focus:border-accent-primary transition"
                        />
                      </div>
                    ))}
                  </div>
                )}
                {chapter.images.length < 3 && (
                  <label className="block w-full px-3 py-2 border border-dashed border-border rounded-md text-text-secondary hover:border-accent-primary hover:text-text-primary transition cursor-pointer text-center text-sm">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleChapterImages(index, e.target.files)}
                    />
                    + Upload images (max 3, 2MB each)
                  </label>
                )}
              </div>

              {index !== 0 && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chapter.isFree}
                    onChange={(e) =>
                      updateChapter(index, "isFree", e.target.checked)
                    }
                    className="w-4 h-4 accent-accent-primary"
                  />
                  <span className="text-sm text-text-secondary">
                    Free chapter
                  </span>
                </label>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <button
          type="button"
          onClick={addChapter}
          disabled={form.chapters.length >= 5}
          className="w-full px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:border-accent-primary transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Add Chapter
        </button>
      </div>

      <button
        type="submit"
        disabled={!isValid}
        className="w-full px-4 py-2 rounded-lg btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Create Book
      </button>
    </form>
  );
}
