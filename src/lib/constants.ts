/**
 * Application constants
 * Centralized configuration for limits, constraints, and magic numbers
 */

// Input field character limits
export const INPUT_LIMITS = {
  bookTitle: 100,
  author: 60,
  description: 500,
  chapterTitle: 120,
  chapterContent: 5000,
  caption: 200,
  password: 128,
  email: 254,
  name: 100,
} as const;

// Image constraints
export const IMAGE_CONSTRAINTS = {
  maxSize: 2 * 1024 * 1024, // 2MB in bytes
  maxSizeDisplay: "2MB",
  allowedTypes: [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ] as const,
  maxChapterImages: 3,
  maxBookCover: 1,
} as const;

// Book/Chapter constraints
export const CONTENT_CONSTRAINTS = {
  maxChaptersPerBook: 5,
  minChaptersPerBook: 1,
  maxDiscount: 999,
  minDiscount: 0,
  maxPricePrecision: 2,
} as const;

// Storage keys
export const STORAGE_KEYS = {
  books: "story-platform-books",
  chapters: "story-platform-chapters",
  user: "story-platform-user",
} as const;

// Route paths
export const ROUTES = {
  home: "/",
  login: "/auth/login",
  register: "/auth/register",
  profile: "/profile",
  dashboard: "/dashboard/books",
  editBook: (bookId: string) => `/dashboard/books/edit/${bookId}`,
  book: (slug: string) => `/book/${slug}`,
  chapter: (bookSlug: string, chapterSlug: string) =>
    `/book/${bookSlug}/chapter/${chapterSlug}`,
} as const;

// Animation durations (ms)
export const ANIMATION = {
  fast: 150,
  normal: 200,
  slow: 300,
  modal: 250,
} as const;

// Debounce delays (ms)
export const DEBOUNCE = {
  search: 300,
  resize: 100,
  scroll: 50,
} as const;
