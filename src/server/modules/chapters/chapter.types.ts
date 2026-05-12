/**
 * Chapter module type definitions
 */

export interface ChapterImageDto {
  url: string;
  caption?: string;
}

export interface CreateChapterDto {
  title: string;
  content: string;
  slug: string;
  price?: number;
  discount?: number;
  images?: ChapterImageDto[];
}

export interface UpdateChapterDto {
  title?: string;
  content?: string;
  slug?: string;
  price?: number;
  discount?: number;
  images?: ChapterImageDto[];
}

export interface ChapterWithImages {
  id: string;
  title: string;
  content: string;
  slug: string;
  price: number;
  discount: number | null;
  bookId: string;
  createdAt: Date;
  images: ChapterImage[];
}

export interface ChapterImage {
  id: string;
  url: string | null;
  caption: string | null;
  chapterId: string;
  createdAt: Date;
}
