import { prisma } from "@/server/prisma";
import { applyComputedPricing, applyComputedPricingToChapters, normalizeChapterPricing } from "@/server/services/pricingService";

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

  return applyComputedPricingToChapters(chapters);
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

  return applyComputedPricing(chapter);
}

export async function createChapter(
  bookId: string,
  payload: {
    title: string;
    content: string;
    slug: string;
    price?: number;
    isFree?: boolean;
    discount?: number;
  }
) {
  const normalized = normalizeChapterPricing(payload.isFree, payload.price, payload.discount);

  const chapter = await prisma.chapter.create({
    data: {
      title: payload.title,
      content: payload.content,
      slug: payload.slug,
      bookId,
      price: normalized.price,
      discount: normalized.discount,
    },
  });

  return applyComputedPricing(chapter);
}
