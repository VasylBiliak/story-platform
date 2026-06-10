/**
 * Chapter repository - Prisma data access layer
 */

import { prisma } from "@/server/prisma";
import type { CreateChapterDto, UpdateChapterDto, ChapterWithImages, ChapterImage } from "./chapter.types";

export async function createChapterRepository(
  bookId: string,
  data: CreateChapterDto
): Promise<ChapterWithImages> {
  console.log("[CREATE_CHAPTER_REPOSITORY] Input:", { bookId, data });

  const chapter = await prisma.chapter.create({
    data: {
      title: data.title,
      content: data.content,
      slug: data.slug,
      price: data.price ?? 0,
      discount: data.discount ?? 0,
      bookId,
      images: data.images && data.images.length > 0
        ? {
            create: data.images.map((img) => ({
              url: img.url,
              caption: img.caption,
            })),
          }
        : undefined,
    },
    include: {
      images: true,
    },
  });

  console.log("[CREATE_CHAPTER_REPOSITORY] Result:", chapter);
  return chapter as ChapterWithImages;
}

export async function updateChapterRepository(
  chapterId: string,
  data: UpdateChapterDto
): Promise<ChapterWithImages> {
  const chapter = await prisma.chapter.update({
    where: { id: chapterId },
    data: {
      title: data.title,
      content: data.content,
      slug: data.slug,
      price: data.price,
      discount: data.discount,

      ...(data.images !== undefined && {
        images: {
          deleteMany: {},
          ...(data.images.length > 0 && {
            create: data.images.map((img) => ({
              url: img.url,
              caption: img.caption,
            })),
          }),
        },
      }),
    },
    include: {
      images: true,
    },
  });

  return chapter as ChapterWithImages;
}

export async function getChapterByIdRepository(
  chapterId: string
): Promise<ChapterWithImages | null> {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      images: true,
    },
  });

  return chapter as ChapterWithImages | null;
}

export async function getChapterBySlugRepository(
  bookId: string,
  slug: string
): Promise<ChapterWithImages | null> {
  const chapter = await prisma.chapter.findFirst({
    where: {
      bookId,
      slug,
    },
    include: {
      images: true,
    },
  });

  return chapter as ChapterWithImages | null;
}

export async function getChaptersByBookIdRepository(
  bookId: string
): Promise<ChapterWithImages[]> {
  const chapters = await prisma.chapter.findMany({
    where: { bookId },
    orderBy: { createdAt: "asc" },
    include: {
      images: true,
    },
  });

  return chapters as ChapterWithImages[];
}

export async function deleteChapterRepository(chapterId: string): Promise<void> {
  await prisma.chapter.delete({
    where: { id: chapterId },
  });
}

export async function deleteChapterImagesRepository(
  chapterId: string
): Promise<void> {
  await prisma.chapterImage.deleteMany({
    where: { chapterId },
  });
}

export async function chapterExistsRepository(
  chapterId: string
): Promise<boolean> {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { id: true },
  });

  return chapter !== null;
}

export async function getBookIdByChapterRepository(
  chapterId: string
): Promise<string | null> {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { bookId: true },
  });

  return chapter?.bookId ?? null;
}

export async function checkChapterOwnershipRepository(
  chapterId: string,
  userId: string
): Promise<boolean> {
  try {
    const purchase = await prisma.chapterPurchase.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    });

    return purchase !== null;
  } catch (error) {
    console.error("[ChapterRepository] Error checking chapter ownership:", error);
    return false;
  }
}

export async function getChapterByIdWithOwnershipRepository(
  chapterId: string,
  userId?: string
): Promise<ChapterWithImages & { purchased?: boolean } | null> {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      images: true,
    },
  });

  if (!chapter) {
    return null;
  }

  // Check ownership if userId is provided
  let purchased = false;
  if (userId) {
    purchased = await checkChapterOwnershipRepository(chapterId, userId);
  }

  return { ...chapter, purchased } as ChapterWithImages & { purchased?: boolean };
}

export async function getChapterBySlugWithOwnershipRepository(
  bookId: string,
  slug: string,
  userId?: string
): Promise<ChapterWithImages & { purchased?: boolean } | null> {
  const chapter = await prisma.chapter.findFirst({
    where: {
      bookId,
      slug,
    },
    include: {
      images: true,
    },
  });

  if (!chapter) {
    return null;
  }

  // Check ownership if userId is provided
  let purchased = false;
  if (userId) {
    purchased = await checkChapterOwnershipRepository(chapter.id, userId);
  }

  return { ...chapter, purchased } as ChapterWithImages & { purchased?: boolean };
}

export async function getChaptersByBookIdWithOwnershipRepository(
  bookId: string,
  userId?: string
): Promise<(ChapterWithImages & { purchased?: boolean })[]> {
  const chapters = await prisma.chapter.findMany({
    where: { bookId },
    orderBy: { createdAt: "asc" },
    include: {
      images: true,
    },
  });

  // Check ownership for each chapter if userId is provided
  if (userId) {
    const chaptersWithOwnership = await Promise.all(
      chapters.map(async (chapter) => {
        const purchased = await checkChapterOwnershipRepository(chapter.id, userId);
        return { ...chapter, purchased };
      })
    );
    return chaptersWithOwnership as (ChapterWithImages & { purchased?: boolean })[];
  }

  return chapters as (ChapterWithImages & { purchased?: boolean })[];
}

export async function createChapterPurchaseRepository(
  userId: string,
  chapterId: string
): Promise<void> {
  try {
    await prisma.chapterPurchase.create({
      data: {
        userId,
        chapterId,
      },
    });
    console.log("[ChapterRepository] Chapter purchase created successfully:", { userId, chapterId });
  } catch (error) {
    console.error("[ChapterRepository] Error creating chapter purchase:", error);
    throw error;
  }
}
