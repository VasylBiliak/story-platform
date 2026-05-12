/**
 * PURPOSE:
 * Handles cleanup operations related to chapters.
 *
 * RESPONSIBILITIES:
 * - Deletes all images related to a chapter
 * - Keeps delete logic isolated from controller/service layers
 *
 * RULES:
 * - Do NOT handle HTTP responses here
 * - Do NOT validate requests here
 * - Do NOT implement business permissions here
 */

import { prisma } from "@/server/prisma";

export async function deleteChapterImages(chapterId: string): Promise<void> {
  await prisma.chapterImage.deleteMany({
    where: { chapterId },
  });
}
