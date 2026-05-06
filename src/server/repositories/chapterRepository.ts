import { prisma } from "@/server/prisma";

export async function findChaptersByBookId(bookId: string) {
  return prisma.chapter.findMany({
    where: { bookId },
    orderBy: { createdAt: "asc" },
  });
}

export async function findChapterByBookIdAndSlug(bookId: string, slug: string) {
  return prisma.chapter.findFirst({
    where: {
      bookId,
      slug,
    },
  });
}

export async function findAllChapters(bookId?: string, slug?: string) {
  const where: Record<string, unknown> = {};
  if (bookId) {
    Object.assign(where, { bookId });
  }
  if (slug) {
    Object.assign(where, { slug });
  }

  return prisma.chapter.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });
}
