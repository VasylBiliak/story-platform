"use client";

import React, { useState } from "react";
import { FilterDropdown } from "./FilterDropdown";
import { BooksSearchInput } from "./BooksSearchInput";
import { BooksSortRadio } from "./BooksSortRadio";
import { MAX_GENRES_PER_BOOK } from "@/lib/constants/genres";
import { MAX_TAGS_PER_CHAPTER } from "@/lib/constants/tags";

type SortOrder = "newest" | "oldest";

interface CollapsibleFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  sortOrder: SortOrder;
  onSortChange: (value: SortOrder) => void;
  availableGenres: string[];
  selectedGenres: string[];
  onGenreToggle: (genre: string) => void;
  onClearGenres: () => void;
  availableTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearTags: () => void;
  isLoading?: boolean;
}

export function CollapsibleFilters({
  searchQuery,
  onSearchChange,
  onSearch,
  sortOrder,
  onSortChange,
  availableGenres,
  selectedGenres,
  onGenreToggle,
  onClearGenres,
  availableTags,
  selectedTags,
  onTagToggle,
  onClearTags,
  isLoading = false,
}: CollapsibleFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasActiveFilters = selectedGenres.length > 0 || selectedTags.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`mx-auto w-full max-w-md px-4 py-3 border rounded-lg transition-all ${
          hasActiveFilters
            ? "border-accent-primary text-accent-primary bg-accent-primary/5"
            : "border-border text-text-secondary hover:border-accent-primary-hover hover:text-text-primary"
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-medium">
            {isExpanded ? "Hide Filters" : "Show Filters"}
          </span>
          {hasActiveFilters && (
            <span className="text-xs bg-accent-primary text-white px-2 py-0.5 rounded-full">
              {selectedGenres.length + selectedTags.length}
            </span>
          )}
        </div>
      </button>

      {/* Collapsible Filter Section */}
      {isExpanded && (
        <div className="flex flex-col gap-4 p-4 bg-bg-secondary border border-border rounded-lg animate-in slide-in-from-top-2 duration-200">
          {/* Search and Sort Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 w-full">
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

          {/* Genre and Tag Dropdowns */}
          <div className="flex flex-col sm:flex-row gap-4">
            <FilterDropdown
              label="Genre"
              options={availableGenres}
              selected={selectedGenres}
              onToggle={onGenreToggle}
              onClear={onClearGenres}
              maxSelections={MAX_GENRES_PER_BOOK}
              disabled={isLoading}
            />
            <FilterDropdown
              label="Tags"
              options={availableTags}
              selected={selectedTags}
              onToggle={onTagToggle}
              onClear={onClearTags}
              maxSelections={MAX_TAGS_PER_CHAPTER}
              disabled={isLoading}
            />
          </div>

          {/* Clear All Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                onClearGenres();
                onClearTags();
              }}
              disabled={isLoading}
              className="self-start text-sm text-accent-primary hover:text-accent-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
