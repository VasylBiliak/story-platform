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
import { supabase } from '@/lib/supabase';

// Remove a single image from Supabase Storage and DB
export async function deleteChapterImageWithStorage(imageId: string): Promise<void> {
  const image = await prisma.chapterImage.findUnique({ where: { id: imageId } });
  if (image && image.url) {
    // Extract storage path from public URL
    const url = new URL(image.url);
    const path = url.pathname.replace(/^\/storage\/v1\/object\/public\/book-images\//, '');
    if (path) {
      await supabase.storage.from('book-images').remove([path]);
    }
  }
  await prisma.chapterImage.delete({ where: { id: imageId } });
}

// Remove all images for a chapter (with storage cleanup)
export async function deleteChapterImages(chapterId: string): Promise<void> {
  const images = await prisma.chapterImage.findMany({ where: { chapterId } });
  for (const image of images) {
    if (image.url) {
      const url = new URL(image.url);
      const path = url.pathname.replace(/^\/storage\/v1\/object\/public\/book-images\//, '');
      if (path) {
        await supabase.storage.from('book-images').remove([path]);
      }
    }
    await prisma.chapterImage.delete({ where: { id: image.id } });
  }
}
