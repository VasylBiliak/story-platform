"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Chapter, ChapterImage } from "@/lib/types";
import { sanitizeText, INPUT_LIMITS, validateImage } from "@/lib/sanitize";
import { Button, Input, Textarea, FileInput, ConfirmModal } from "@/components/ui";
import { useAuth } from "@/components/auth/AuthProvider";


export type BookFormMode = "create" | "edit";

export interface BookFormProps {
  mode: BookFormMode;
  initialData?: {
    book: Book;
    chapters: Chapter[];
  };
  onSubmit?: () => void;
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
  price?: number;
  discount?: number;
  images: ChapterImage[];
};

type FormState = {
  book: {
    title: string;
    description: string;
    cover: string;
  };
  chapters: ChapterInput[];
};

function createInitialState(book?: Book, chapters?: Chapter[]): FormState {
  if (book && chapters) {
    return {
      book: {
        title: book.title,
        description: book.description,
        cover: book.cover,
      },
      chapters: chapters.map((c) => ({
        title: c.title,
        content: c.content,
        isFree: c.isFree,
        price: c.price,
        discount: c.discount,
        images: c.images || [],
      })),
    };
  }
  return {
    book: {
      title: "",
      description: "",
      cover: "",
    },
    chapters: [{ title: "", content: "", isFree: true, images: [] }],
  };
}

function fileToBase64(file: File): Promise<string> {
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

function calculateFinalPrice(price: number, discount: number = 0): number {
  const finalPrice = price * (1 - discount / 100);
  return Math.max(0, Math.round(finalPrice * 100) / 100); // Round to 2 decimal places, clamp to >= 0
}

export function BookForm({ mode, initialData, onSubmit }: BookFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(() =>
    createInitialState(initialData?.book, initialData?.chapters)
  );
  const lastInputRef = useRef<HTMLInputElement | null>(null);
  const [lastAddedIndex, setLastAddedIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  async function getAuthHeaders(): Promise<Record<string, string>> {
    // Token is automatically sent via HTTP-only cookie
    // Additional headers for JSON content
    return {
      "Content-Type": "application/json",
    };
  }

  const updateBook = (field: keyof FormState["book"], value: string) => {
    const sanitized = sanitizeText(value);
    setForm((prev) => ({
      ...prev,
      book: { ...prev.book, [field]: sanitized },
    }));
  };

  const updateChapter = (
    index: number,
    field: keyof ChapterInput,
    value: string | boolean | number
  ) => {
    let safeValue: string | boolean | number | undefined;
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
    const sanitized = sanitizeText(caption);
    setForm((prev) => {
      const next = [...prev.chapters];
      const updatedImages = [...next[chapterIndex].images];
      updatedImages[imageIndex] = { ...updatedImages[imageIndex], caption: sanitized };
      next[chapterIndex] = { ...next[chapterIndex], images: updatedImages };
      return { ...prev, chapters: next };
    });
  };

  const isValid =
    form.book.title.trim().length > 0 &&
    form.book.title.trim().length <= INPUT_LIMITS.bookTitle &&
    form.book.description.trim().length <= INPUT_LIMITS.description &&
    form.book.cover.trim().length > 0 &&
    form.chapters.length >= 1 &&
    form.chapters.every(
      (c) =>
        c.title.trim().length > 0 &&
        c.title.trim().length <= INPUT_LIMITS.chapterTitle &&
        c.content.trim().length > 0 &&
        c.content.trim().length <= INPUT_LIMITS.chapterContent &&
        (c.isFree || (c.price !== undefined && c.price >= 0)) &&
        (c.discount === undefined || (Number.isInteger(c.discount) && c.discount >= 0 && c.discount <= 999)) &&
        c.images.every((img) => img.caption.trim().length <= INPUT_LIMITS.caption)
    );

  const handleDelete = async () => {
    if (!initialData) return;
    const bookId = initialData.book.id;
    setApiError(null);

    try {
      const response = await fetch(`/api/books/${encodeURIComponent(bookId)}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });

      const payload = await response.json();
      if (!payload?.success) {
        setApiError(payload?.error || `Delete failed: HTTP ${response.status}`);
        return;
      }

      router.push("/");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Delete request failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setApiError(null);

    const bookPayload = {
      title: form.book.title.trim(),
      description: form.book.description.trim(),
      cover: form.book.cover.trim(),
      chapters: form.chapters.map((c, i) => ({
        title: c.title.trim(),
        slug: slugify(c.title) || `chapter-${i + 1}`,
        content: c.content.trim(),
        isFree: i === 0 ? true : c.isFree,
        price: c.isFree ? undefined : c.price,
        discount: c.isFree ? undefined : c.discount,
        finalPrice:
          c.isFree || c.price === undefined
            ? undefined
            : calculateFinalPrice(c.price, c.discount || 0),
      })),
    };

    try {
      const endpoint = mode === "create" ? "/api/books" : `/api/books/${encodeURIComponent(initialData?.book.id ?? "")}`;
      const method = mode === "create" ? "POST" : "PUT";
      const response = await fetch(endpoint, {
        method,
        headers: await getAuthHeaders(),
        body: JSON.stringify(bookPayload),
      });

      const payload = await response.json();
      if (!payload?.success) {
        setApiError(payload?.error || `Save failed: HTTP ${response.status}`);
        return;
      }

      onSubmit?.();

      const bookSlug = payload.data?.id;
      if (mode === "create") {
        setForm(createInitialState());
      }

      if (bookSlug) {
        router.push(`/book/${bookSlug}`);
      } else {
        router.push("/dashboard/books");
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Save request failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Book Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-text-primary">
          {mode === "edit" ? "Edit Book Details" : "Book Details"}
        </h3>

        <Input
          label="Title"
          value={form.book.title}
          onChange={(e) => updateBook("title", e.target.value)}
          maxLength={INPUT_LIMITS.bookTitle}
          showCharacterCount
          placeholder="Book title"
          required
        />

        <Textarea
          label="Description"
          value={form.book.description}
          onChange={(e) => updateBook("description", e.target.value)}
          maxLength={INPUT_LIMITS.description}
          showCharacterCount
          placeholder="Book description"
          rows={4}
        />

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
            <FileInput
              onFileSelect={(base64) => setForm((prev) => ({ ...prev, book: { ...prev.book, cover: base64 } }))}
              placeholder="+ Upload cover image (PNG, JPEG, WebP)"
            />
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
                  ref={lastAddedIndex === index ? lastInputRef : undefined}
                  value={chapter.title}
                  onChange={(e) =>
                    updateChapter(index, "title", e.target.value)
                  }
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
                  onChange={(e) =>
                    updateChapter(index, "content", e.target.value)
                  }
                  maxLength={INPUT_LIMITS.chapterContent}
                  className="w-full px-3 py-2 bg-bg-primary border border-border rounded-md text-text-primary outline-none focus:border-accent-primary transition min-h-25"
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
                          maxLength={INPUT_LIMITS.caption}
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
                      accept="image/png,image/jpeg,image/webp"
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
                      onChange={(e) =>
                        updateChapter(index, "price", e.target.value)
                      }
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
                      max="999"
                      step="1"
                      value={chapter.discount ?? ""}
                      onChange={(e) =>
                        updateChapter(index, "discount", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-bg-primary border border-border rounded-md text-text-primary outline-none focus:border-accent-primary transition"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              {!chapter.isFree && chapter.price !== undefined && (
                <div className="p-3 bg-bg-secondary rounded-lg border border-border">
                  <p className="text-sm text-text-secondary">
                    Final Price:{" "}
                    <span className="font-semibold text-accent-primary">
                      ${calculateFinalPrice(chapter.price, chapter.discount || 0).toFixed(2)}
                    </span>
                    {chapter.discount && chapter.discount > 0 && (
                      <>
                        {" "}
                        <span className="text-text-tertiary line-through">
                          ${chapter.price.toFixed(2)}
                        </span>
                        <span className="ml-2 text-text-tertiary">
                          -{chapter.discount}%
                        </span>
                      </>
                    )}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <Button
          type="button"
          variant="secondary"
          onClick={addChapter}
          disabled={form.chapters.length >= 5}
          className="w-full"
        >
          + Add Chapter
        </Button>
      </div>

      {apiError && (
        <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {apiError}
        </div>
      )}

      <div className="flex gap-3">
        {mode === "edit" && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsModalOpen(true)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={!isValid}
          className="flex-1"
        >
          {mode === "edit" ? "Save Changes" : "Create Book"}
        </Button>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        title="Delete Book"
        description="This action cannot be undone. Are you sure you want to delete this book and all its chapters?"
        onConfirm={handleDelete}
        onCancel={() => setIsModalOpen(false)}
        confirmButtonText="Delete"
      />
    </form>
  );
}