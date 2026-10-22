"use client";

import React from "react";
import { BOOK_GENRES, MAX_GENRES_PER_BOOK } from "@/lib/constants/genres";

interface BooksGenreFilterProps {
  selectedGenres: string[];
  onGenreToggle: (genre: string) => void;
  onClearGenres: () => void;
  disabled?: boolean;
}

export function BooksGenreFilter({
  selectedGenres,
  onGenreToggle,
  onClearGenres,
  disabled = false,
}: BooksGenreFilterProps) {
  const canAddMore = selectedGenres.length < MAX_GENRES_PER_BOOK;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">
          Filter by Genre
        </span>
        {selectedGenres.length > 0 && (
          <button
            type="button"
            onClick={onClearGenres}
            disabled={disabled}
            className="text-xs text-accent-primary hover:text-accent-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {BOOK_GENRES.map((genre) => (
          <button
            key={genre}
            type="button"
            onClick={() => onGenreToggle(genre)}
            disabled={disabled || (!selectedGenres.includes(genre) && !canAddMore)}
            className={`px-3 py-1.5 text-xs rounded-full border transition ${
              selectedGenres.includes(genre)
                ? "bg-accent-primary text-white border-accent-primary"
                : "bg-bg-primary text-text-secondary border-border hover:border-accent-primary"
            } ${(!selectedGenres.includes(genre) && !canAddMore) ? "opacity-50 cursor-not-allowed" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {genre}
          </button>
        ))}
      </div>
      {selectedGenres.length >= MAX_GENRES_PER_BOOK && (
        <p className="text-xs text-text-tertiary">
          Maximum {MAX_GENRES_PER_BOOK} genres can be selected
        </p>
      )}
    </div>
  );
}
