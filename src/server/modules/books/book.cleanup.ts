/**
 * PURPOSE:
 * Handles cleanup operations related to books.
 *
 * RESPONSIBILITIES:
 * - Deletes all chapters related to a book
 * - Deletes all chapter images related to chapters
 * - Keeps delete logic isolated from controller/service layers
 *
 * RULES:
 * - Do NOT handle HTTP responses here
 * - Do NOT validate requests here
 * - Do NOT implement business permissions here
 */

import { prisma } from "@/server/prisma";

export async function deleteBookRelations(bookId: string): Promise<void> {
  const chapters = await prisma.chapter.findMany({
    where: {
      bookId,
    },
    select: {
      id: true,
    },
  });

  const chapterIds = chapters.map(({ id }) => id);

  if (chapterIds.length > 0) {
    await prisma.chapterImage.deleteMany({
      where: {
        chapterId: {
          in: chapterIds,
        },
      },
    });

    await prisma.chapter.deleteMany({
      where: {
        id: {
          in: chapterIds,
        },
      },
    });
  }
}