"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Chapter } from "@/types";
import { INPUT_LIMITS } from "@/lib/sanitize";
import { Button, Input, Textarea, FileInput, ConfirmModal } from "@/components/ui";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocalBooks } from "@/lib/local-books/hooks/useLocalBooks";
import { mapFormToLocalBook, updateLocalBookFromForm } from "@/lib/local-books/localBookMapper";
import { BookReplacementModal } from "@/components/modals/BookReplacementModal";
import { BOOK_GENRES, MAX_GENRES_PER_BOOK } from "@/lib/constants/genres";
import { useBookForm, MAX_CHAPTERS_PER_FORM } from "@/lib/hooks/useBookForm";
import { buildBookPayload, appendChapterImageFiles } from "@/lib/utils/bookFormPayload";
import { FilterDropdown } from "@/components/books/FilterDropdown";
import { SelectedValues } from "@/components/books/SelectedValues";
import { ChapterEditor } from "@/components/books/ChapterEditor";


export type BookFormMode = "create" | "edit";

export interface BookFormProps {
  mode: BookFormMode;
  initialData?: {
    book: Book;
    chapters: Chapter[];
  };
  onSubmit?: () => void;
}

export function BookForm({ mode, initialData, onSubmit }: BookFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { createLocalBook, updateLocalBook: updateLocalBookState, removeLocalBook, isLocalBook } = useLocalBooks();
  const {
    form,
    isValid,
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
  } = useBookForm(initialData?.book, initialData?.chapters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [createLocally, setCreateLocally] = useState(false);
  const [replacementModalOpen, setReplacementModalOpen] = useState(false);
  const [replacementBooks, setReplacementBooks] = useState<any[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  const endpoint = mode === "create" ? "/api/books" : `/api/books/${encodeURIComponent(initialData?.book.id ?? "")}`;
  const method = mode === "create" ? "POST" : "PUT";

  // Check if editing a local book
  useEffect(() => {
    if (mode === "edit" && initialData?.book) {
      const isLocal = isLocalBook(initialData.book.id);
      setCreateLocally(isLocal);
    }
  }, [mode, initialData, isLocalBook]);

  async function getAuthHeaders(): Promise<Record<string, string>> {
    // Token is automatically sent via HTTP-only cookie
    // No Content-Type header needed - browser sets it automatically for FormData
    return {};
  }

  const finishSave = (bookSlug?: string) => {
    onSubmit?.();
    if (mode === "create") {
      resetForm();
    }
    router.push(bookSlug ? `/book/${bookSlug}` : "/dashboard/books");
  };

  const handleDelete = async () => {
    if (!initialData) return;
    const bookId = initialData.book.id;
    setApiError(null);

    // Check if this is a local book
    if (isLocalBook(bookId)) {
      removeLocalBook(bookId);
      router.push("/dashboard/books");
      return;
    }

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

      router.push("/dashboard/books");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Delete request failed");
    }
  };

  const handleReplacementConfirm = async () => {
    if (!selectedBookId || !pendingFormData) return;

    setApiError(null);
    setReplacementModalOpen(false);

    // Add replaceBookId to the pending form data
    pendingFormData.append("replaceBookId", selectedBookId);

    try {
      const response = await fetch(endpoint, {
        method,
        headers: await getAuthHeaders(),
        body: pendingFormData,
      });

      const payload = await response.json();

      if (!payload?.createdBook && !payload?.success) {
        setApiError(payload?.error || `Save failed: HTTP ${response.status}`);
        return;
      }

      finishSave(payload.createdBook?.id || payload.data?.id);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Save request failed");
    } finally {
      setPendingFormData(null);
      setSelectedBookId(null);
    }
  };

  const handleReplacementCancel = () => {
    setReplacementModalOpen(false);
    setReplacementBooks([]);
    setSelectedBookId(null);
    setPendingFormData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setApiError(null);

    const bookPayload = buildBookPayload(form, user?.name || "Anonymous");

    // Handle local book creation/update
    if (createLocally) {
      try {
        if (mode === "create") {
          const { book, chapters } = mapFormToLocalBook(
            {
              title: bookPayload.title,
              description: bookPayload.description,
              cover: bookPayload.cover,
              author: bookPayload.author,
            },
            bookPayload.chapters
          );
          createLocalBook(book, chapters);
          resetForm();
          router.push(`/book/${book.id}`);
        } else if (mode === "edit" && initialData?.book) {
          const existingBook = isLocalBook(initialData.book.id)
            ? initialData.book as any
            : null;

          if (existingBook) {
            const { book, chapters } = updateLocalBookFromForm(
              existingBook,
              {
                title: bookPayload.title,
                description: bookPayload.description,
                cover: bookPayload.cover,
                author: bookPayload.author,
              },
              bookPayload.chapters
            );
            updateLocalBookState(book, chapters);
            router.push(`/book/${book.id}`);
          }
        }
        onSubmit?.();
        return;
      } catch (err) {
        setApiError(err instanceof Error ? err.message : "Failed to save local book");
        return;
      }
    }

    // Handle backend API call
    const formData = new FormData();
    formData.append("book", JSON.stringify(bookPayload));
    appendChapterImageFiles(formData, form.chapters);

    try {
      const response = await fetch(endpoint, {
        method,
        headers: await getAuthHeaders(),
        body: formData,
      });

      const payload = await response.json();

      // Handle 409 Conflict - book limit reached, requires replacement
      if (response.status === 409 && payload?.requiresReplacement) {
        setReplacementBooks(payload.books || []);
        setPendingFormData(formData);
        setReplacementModalOpen(true);
        return;
      }

      // Handle new limit response structure (legacy)
      if (payload?.replacedBook || payload?.createdBook) {
        if (payload?.replacedBook) {
          setApiError(`${payload.message} Book ID: ${payload.replacedBook.id.substring(0, 8)}...`);
        }
        finishSave(payload.createdBook?.id);
        return;
      }

      // Handle legacy success/error response
      if (!payload?.success) {
        setApiError(payload?.error || `Save failed: HTTP ${response.status}`);
        return;
      }

      finishSave(payload.data?.id);
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

        {mode === "create" && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={createLocally}
              onChange={(e) => setCreateLocally(e.target.checked)}
              className="w-4 h-4 accent-accent-primary"
            />
            <span className="text-sm text-text-secondary">
              Create locally (save to browser only)
            </span>
          </label>
        )}

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
          <FilterDropdown
            label="Genres"
            options={BOOK_GENRES}
            selected={form.book.genres}
            onToggle={toggleGenre}
            onClear={() => updateBook("genres", [])}
            maxSelections={MAX_GENRES_PER_BOOK}
            searchable
            closeOnMouseLeave
          />
          <SelectedValues values={form.book.genres} />
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
                onClick={() => setCover("")}
                className="absolute top-1 right-1 w-6 h-6 bg-bg-primary/90 text-text-secondary hover:text-accent-primary rounded-full flex items-center justify-center text-sm transition"
                title="Remove cover"
              >
                ×
              </button>
            </div>
          ) : (
            <FileInput
              onFileSelect={setCover}
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
              // Clip only while collapsing, so the tag dropdown menu isn't cut off
              exit={{ opacity: 0, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, overflow: "hidden" }}
              transition={{ duration: 0.2 }}
              className="p-4 border border-border rounded-lg space-y-3"
            >
              <ChapterEditor
                chapter={chapter}
                index={index}
                canRemove={form.chapters.length > 1}
                titleRef={chapterTitleRef(index)}
                onChange={(field, value) => updateChapter(index, field, value)}
                onRemove={() => removeChapter(index)}
                onToggleTag={(tag) => toggleTag(index, tag)}
                onAddImages={(files) => addChapterImages(index, files)}
                onRemoveImage={(imageIndex) => removeChapterImage(index, imageIndex)}
                onImageCaptionChange={(imageIndex, caption) => updateChapterImageCaption(index, imageIndex, caption)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

      <Button
        type="button"
        variant="secondary"
        onClick={addChapter}
        disabled={form.chapters.length >= MAX_CHAPTERS_PER_FORM }
        className="w-full"
      >
        {form.chapters.length >= MAX_CHAPTERS_PER_FORM 
          ? "Maximum number of chapters reached (" + MAX_CHAPTERS_PER_FORM + "). You have reached the demo limit." 
          : "+ Add Chapter"}
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

      <BookReplacementModal
        isOpen={replacementModalOpen}
        books={replacementBooks}
        selectedBookId={selectedBookId}
        onSelectBook={setSelectedBookId}
        onConfirm={handleReplacementConfirm}
        onCancel={handleReplacementCancel}
      />
    </form>
  );
}
