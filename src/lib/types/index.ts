export interface Book {
  id: string;
  title: string;
  description: string;
  cover: string;
  author: string;
  images?: string[];
}

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  slug: string;
  content: string;
  isFree: boolean;
  price?: number;
  images?: string[];
}
