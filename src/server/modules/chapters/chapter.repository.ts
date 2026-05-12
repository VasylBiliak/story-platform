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
