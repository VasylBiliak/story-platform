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
