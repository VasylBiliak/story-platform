import { prisma } from "@/server/prisma";
import type { ChapterCreateInput } from "@/lib/validators/chapter";
import type { UploadedFile } from "@/lib/upload";
import type { Chapter } from "@/lib/types";

function calculateFinalPrice(price: number, discount: number = 0): number {
  const finalPrice = price * (1 - discount / 100);
  return Math.max(0, Math.round(finalPrice * 100) / 100);
}

function calculateIsFree(price: number): boolean {
  return price === 0;
}

export class ChapterService {
  static async createChapter(
    data: ChapterCreateInput,
    images: UploadedFile[],
    userId: string
  ) {
    try {
      const chapter = await prisma.$transaction(async (tx) => {
        const book = await tx.book.findUnique({
          where: { id: data.bookId },
        });

        if (!book) {
          throw new Error("Book not found");
        }

        if (book.ownerId !== userId) {
          throw new Error("Forbidden");
        }

        const newChapter = await tx.chapter.create({
          data: {
            title: data.title,
            content: data.content,
            slug: data.slug,
            bookId: data.bookId,
            price: data.isFree ? 0 : (data.price ?? 0),
          },
        });

        if (images.length > 0) {
          await tx.chapterImage.createMany({
            data: images.map((img) => ({
              url: img.url,
              chapterId: newChapter.id,
            })),
          });
        }

        return newChapter;
      });

      const chapterWithImages = await prisma.chapter.findUnique({
        where: { id: chapter.id },
        include: {
          images: true,
          book: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      // Add computed fields
      if (chapterWithImages) {
        return {
          ...chapterWithImages,
          isFree: calculateIsFree(chapterWithImages.price),
          finalPrice: calculateFinalPrice(chapterWithImages.price, chapterWithImages.discount || 0),
        } as any;
      }

      return chapterWithImages;
    } catch (error) {
      console.error("[ChapterService] Create error:", error);
      if (error instanceof Error && error.message === "Forbidden") {
        throw error;
      }
      if (error instanceof Error && error.message === "Book not found") {
        throw error;
      }
      throw new Error("Failed to create chapter");
    }
  }

  static async getChapterById(chapterId: string) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        images: true,
        book: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!chapter) return null;

    // Add computed fields
    return {
      ...chapter,
      isFree: calculateIsFree(chapter.price),
      finalPrice: calculateFinalPrice(chapter.price, chapter.discount || 0),
    } as any;
  }

  static async getChaptersByBookId(bookId: string) {
    const chapters = await prisma.chapter.findMany({
      where: { bookId },
      include: {
        images: true,
      },
    });

    // Add computed fields
    return chapters.map(chapter => ({
      ...chapter,
      isFree: calculateIsFree(chapter.price),
      finalPrice: calculateFinalPrice(chapter.price, chapter.discount || 0),
    })) as any;
  }

  static async verifySlugUnique(bookId: string, slug: string): Promise<boolean> {
    const existing = await prisma.chapter.findFirst({
      where: {
        bookId,
        slug,
      },
    });

    return !existing;
  }
}
