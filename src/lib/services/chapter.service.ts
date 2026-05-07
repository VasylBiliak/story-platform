import { prisma } from "@/server/prisma";
import type { ChapterCreateInput } from "@/lib/validators/chapter";
import type { UploadedFile } from "@/lib/upload";

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
    return prisma.chapter.findUnique({
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
  }

  static async getChaptersByBookId(bookId: string) {
    return prisma.chapter.findMany({
      where: { bookId },
      include: {
        images: true,
      },
    });
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
