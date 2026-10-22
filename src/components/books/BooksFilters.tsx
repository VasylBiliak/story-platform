"use client";

import React from "react";
import { BooksSearchInput } from "./BooksSearchInput";
import { BooksSortRadio } from "./BooksSortRadio";
import { BooksGenreFilter } from "./BooksGenreFilter";

type SortOrder = "newest" | "oldest";

interface BooksFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  sortOrder: SortOrder;
  onSortChange: (value: SortOrder) => void;
  selectedGenres: string[];
  onGenreToggle: (genre: string) => void;
  onClearGenres: () => void;
  isLoading?: boolean;
}

export function BooksFilters({
  searchQuery,
  onSearchChange,
  onSearch,
  sortOrder,
  onSortChange,
  selectedGenres,
  onGenreToggle,
  onClearGenres,
  isLoading = false,
}: BooksFiltersProps) {
  return (
    <div className="flex flex-col gap-6 mb-8">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-md">
          <BooksSearchInput
            value={searchQuery}
            onChange={onSearchChange}
            onSearch={onSearch}
            isLoading={isLoading}
          />
        </div>
        <BooksSortRadio
          value={sortOrder}
          onChange={onSortChange}
          disabled={isLoading}
        />
      </div>
      <BooksGenreFilter
        selectedGenres={selectedGenres}
        onGenreToggle={onGenreToggle}
        onClearGenres={onClearGenres}
        disabled={isLoading}
      />
    </div>
  );
}
