import { prisma } from "@/server/prisma";

function calculateFinalPrice(price: number, discount: number = 0): number {
  const finalPrice = price * (1 - discount / 100);
  return Math.max(0, Math.round(finalPrice * 100) / 100);
}

function calculateIsFree(price: number): boolean {
  return price === 0;
}

export async function getChapters(bookId?: string, slug?: string) {
  const chapters = await prisma.chapter.findMany({
    where: {
      bookId: bookId || undefined,
      slug: slug || undefined,
    },
    include: {
      images: true,
    },
  });

  return chapters.map((chapter) => ({
    ...chapter,
    isFree: calculateIsFree(chapter.price),
    finalPrice: calculateFinalPrice(chapter.price, chapter.discount || 0),
  }));
}

export async function getChapterBySlug(bookId: string, slug: string) {
  const chapter = await prisma.chapter.findFirst({
    where: {
      bookId,
      slug,
    },
    include: {
      images: true,
    },
  });

  if (!chapter) return null;

  return {
    ...chapter,
    isFree: calculateIsFree(chapter.price),
    finalPrice: calculateFinalPrice(chapter.price, chapter.discount || 0),
  };
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
  const chapter = await prisma.chapter.create({
    data: {
      title: payload.title,
      content: payload.content,
      slug: payload.slug,
      bookId,
      price: payload.isFree ? 0 : payload.price ?? 0,
    },
  });

  return {
    ...chapter,
    isFree: calculateIsFree(chapter.price),
    finalPrice: calculateFinalPrice(chapter.price, chapter.discount || 0),
  };
}

