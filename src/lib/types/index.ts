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
  images?: string[]; // max 3
}

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  slug: string;
  content: string;
  isFree: boolean;
  price?: number;        // base price in USD
  discount?: number;     // percentage (0–999)
  finalPrice?: number;   // computed
  images?: ChapterImage[]; // max 3
}
