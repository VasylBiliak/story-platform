import { prisma } from "@/server/prisma";
import type { ChapterCreateInput } from "@/lib/validators/chapter";
import type { UploadedFile } from "@/types";
import type { Chapter } from "@/lib/types";
import { applyComputedPricing, applyComputedPricingToChapters, normalizeChapterPricing } from "@/server/services/pricingService";

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

        const normalized = normalizeChapterPricing(data.isFree, data.price, undefined);
        const price = normalized.price;
        const discount = normalized.discount;

        const newChapter = await tx.chapter.create({
          data: {
            title: data.title,
            content: data.content,
            slug: data.slug,
            bookId: data.bookId,
            price,
            discount,
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
        return applyComputedPricing(chapterWithImages) as any;
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

  static async getChapterById(chapterId: string, userId?: string) {
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

    // Check ownership for paid chapters
    let purchased = false;
    if (userId && chapter.price > 0) {
      try {
        const purchase = await prisma.chapterPurchase.findUnique({
          where: {
            userId_chapterId: {
              userId,
              chapterId,
            },
          },
        });
        purchased = purchase !== null;
      } catch (error) {
        // Table doesn't exist yet - treat as not purchased
        console.warn("[ChapterService] ChapterPurchase table not available, treating as not purchased");
        purchased = false;
      }
    }

    // Add computed fields
    const chapterWithPricing = applyComputedPricing(chapter) as any;
    chapterWithPricing.purchased = purchased;

    // Apply access control: remove content for paid chapters not purchased
    const isFree = chapter.price === 0;
    if (!isFree && !purchased) {
      chapterWithPricing.content = "";
    }

    return chapterWithPricing;
  }

  static async getChaptersByBookId(bookId: string, userId?: string) {
    const chapters = await prisma.chapter.findMany({
      where: { bookId },
      include: {
        images: true,
      },
    });

    // Check ownership for each paid chapter
    const chaptersWithOwnership = await Promise.all(
      chapters.map(async (chapter) => {
        let purchased = false;
        if (userId && chapter.price > 0) {
          try {
            const purchase = await prisma.chapterPurchase.findUnique({
              where: {
                userId_chapterId: {
                  userId,
                  chapterId: chapter.id,
                },
              },
            });
            purchased = purchase !== null;
          } catch (error) {
            // Table doesn't exist yet - treat as not purchased
            console.warn("[ChapterService] ChapterPurchase table not available, treating as not purchased");
            purchased = false;
          }
        }

        // Add computed fields
        const chapterWithPricing = applyComputedPricing(chapter) as any;
        chapterWithPricing.purchased = purchased;

        // Apply access control: remove content for paid chapters not purchased
        const isFree = chapter.price === 0;
        if (!isFree && !purchased) {
          chapterWithPricing.content = "";
        }

        return chapterWithPricing;
      })
    );

    return chaptersWithOwnership;
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

  static async createChapterPurchase(userId: string, chapterId: string) {
    try {
      await prisma.chapterPurchase.create({
        data: {
          userId,
          chapterId,
        },
      });
    } catch (error: any) {
      console.error("[ChapterService] Create purchase error:", error);
      // If table doesn't exist, log a warning but don't crash
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        console.warn("[ChapterService] ChapterPurchase table not available, purchase not created");
        return;
      }
      throw new Error("Failed to create chapter purchase");
    }
  }
}
