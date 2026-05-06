import { findAllChapters, findChapterByBookIdAndSlug } from "@/server/repositories/chapterRepository";

export async function getChapters(bookId?: string, slug?: string) {
  return findAllChapters(bookId, slug);
}

export async function getChapterBySlug(bookId: string, slug: string) {
  return findChapterByBookIdAndSlug(bookId, slug);
}
