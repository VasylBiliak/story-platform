export const BOOK_GENRES = [
  "Fantasy",
  "Mystery & Horror",
  "Adventure",
  "Romance",
  "Science Fiction",
  "Thriller",
  "Drama",
  "Comedy",
  "Historical Fiction",
  "Contemporary",
] as const;

export type BookGenre = typeof BOOK_GENRES[number];

export const MAX_GENRES_PER_BOOK = 5;
