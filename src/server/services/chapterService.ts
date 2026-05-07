import { prisma } from "@/server/prisma";

export async function getChapters(bookId?: string, slug?: string) {
  return prisma.chapter.findMany({
    where: {
      bookId: bookId || undefined,
      slug: slug || undefined,
    },
  });
}

export async function getChapterBySlug(bookId: string, slug: string) {
  return prisma.chapter.findFirst({
    where: {
      bookId,
      slug,
    },
  });
}

export async function createChapter(
  bookId: string,
  payload: {
    title: string;
    content: string;
    slug: string;
    price?: number;
    isFree?: boolean;
  }
) {
  return prisma.chapter.create({
    data: {
      title: payload.title,
      content: payload.content,
      slug: payload.slug,
      bookId,
      price: payload.isFree ? 0 : payload.price ?? 0,
    },
  });
}

