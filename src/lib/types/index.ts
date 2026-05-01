export interface ChapterImage {
  url: string; // base64
  caption: string;
}

export interface Book {
  id: string;
  title: string;
  description: string;
  cover: string; // base64 (required)
  author: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  slug: string;
  content: string;
  isFree: boolean;
  price?: number;
  images?: ChapterImage[]; // max 3
}
