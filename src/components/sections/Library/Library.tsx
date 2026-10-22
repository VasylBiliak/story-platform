"use client";

import React, { useState, useEffect } from "react";
import { Book } from "@/lib/types";
import { RemotwBooksGrid } from "@/components/books/RemotwBooksGrid";
import { LocalBooksGrid } from "@/components/books/LocalBooksGrid";
import { LoadMoreButton } from "@/components/ui/LoadMoreButton/LoadMoreButton";
import { CollapsibleFilters } from "@/components/books/CollapsibleFilters";
import { useBooksPagination } from "@/lib/hooks/useBooksPagination";
import { MAX_GENRES_PER_BOOK } from "@/lib/constants/genres";
import { MAX_TAGS_PER_CHAPTER } from "@/lib/constants/tags";

type SortOrder = "newest" | "oldest";

type ExtendedBook = Book & { isLocal?: boolean };

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Fetch available genres and tags on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch('/api/books?includeMetadata=true&limit=1');
        const payload = await response.json();
        console.log('[Library] Metadata response:', payload);
        if (payload.success && payload.data?.metadata) {
          setAvailableGenres(payload.data.metadata.genres || []);
          setAvailableTags(payload.data.metadata.tags || []);
          console.log('[Library] Available genres:', payload.data.metadata.genres);
          console.log('[Library] Available tags:', payload.data.metadata.tags);
        } else {
          console.error('[Library] Invalid metadata response:', payload);
        }
      } catch (error) {
        console.error('[Library] Failed to fetch filter metadata:', error);
      }
    };
    fetchMetadata();
  }, []);

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else if (selectedGenres.length < MAX_GENRES_PER_BOOK) {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const clearGenres = () => {
    setSelectedGenres([]);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < MAX_TAGS_PER_CHAPTER) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearTags = () => {
    setSelectedTags([]);
  };

  const {
    books: remoteBooks,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  } = useBooksPagination({
    initialLimit: 8,
    mergeWithLocal: false,
    search: searchQuery,
    sort: sortOrder,
    genres: selectedGenres,
    tags: selectedTags,
  });

  const mappedRemoteBooks: ExtendedBook[] = remoteBooks.map((b) => ({
    ...b,
    isLocal: false,
  }));

  const handleSearch = () => {
    refresh();
  };

  const handleSortChange = (value: SortOrder) => {
    setSortOrder(value);
    refresh();
  };

  const handleGenreToggle = (genre: string) => {
    toggleGenre(genre);
    setTimeout(() => refresh(), 0);
  };

  const handleClearGenres = () => {
    clearGenres();
    setTimeout(() => refresh(), 0);
  };

  const handleTagToggle = (tag: string) => {
    toggleTag(tag);
    setTimeout(() => refresh(), 0);
  };

  const handleClearTags = () => {
    clearTags();
    setTimeout(() => refresh(), 0);
  };

  return (
    <section className="flex flex-col gap-8 px-2 sm:px-4 md:px-8 py-8" id="books">
      <h1 className="font-[Oswald] text-3xl font-bold uppercase tracking-[3px] mb-8 text-text-primary flex justify-center align-center">
        Library
      </h1>     
      {/* Filters */}
      <CollapsibleFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        availableGenres={availableGenres}
        selectedGenres={selectedGenres}
        onGenreToggle={handleGenreToggle}
        onClearGenres={handleClearGenres}
        availableTags={availableTags}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        onClearTags={handleClearTags}
        isLoading={isLoading}
      />

      {/* Remote Books with Pagination */}
      {isLoading && remoteBooks.length === 0 ? (
        <p className="text-text-secondary text-center py-12">
          Loading books...
        </p>
      ) : remoteBooks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary mb-4">No books found</p>
        </div>
      ) : (
        <>
          <RemotwBooksGrid books={mappedRemoteBooks} />
          <LoadMoreButton
            onClick={loadMore}
            isLoading={isLoadingMore}
            hasMore={hasMore}
          />
        </>
      )}
      <LocalBooksGrid />
    </section>
  );
}
