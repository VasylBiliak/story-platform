import { prisma } from "@/server/prisma";
import type { BookCreateInput } from "@/lib/validators/book";
import type { UploadedFile } from "@/lib/upload";
import type { Chapter } from "@/lib/types";
import { applyComputedPricing, applyComputedPricingToChapters, normalizeChapterPricing } from "@/server/services/pricingService";

export class BookService {
  static async createBookWithChapters(
    data: BookCreateInput,
    uploadedChapterImages: UploadedFile[][],
    userId: string,
    authorName: string
  ) {
    try {
      console.log("[BOOK_CREATE_PAYLOAD]", JSON.stringify(data, null, 2));
      console.log("[UPLOADED_IMAGES_COUNT]", uploadedChapterImages.map((imgs) => imgs.length));

      const book = await prisma.$transaction(async (tx) => {
        // Step 1: Create Book
        const createdBook = await tx.book.create({
          data: {
            title: data.title,
            description: data.description,
            cover: data.cover,
            price: data.price ?? 0,
            author: authorName,
            ownerId: userId,
          },
        });

        console.log("[BOOK_CREATED]", createdBook.id);

        // Step 2: Create Chapters sequentially
        const chapters = data.chapters || [];
        const createdChapters = [];

        for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
          const chapter = chapters[chapterIndex];
          const chapterImages = uploadedChapterImages[chapterIndex] || [];

          console.log(`[CHAPTER_${chapterIndex}] Creating chapter "${chapter.title}" with ${chapterImages.length} images`);

          const createdChapter = await tx.chapter.create({
            data: {
              title: chapter.title,
              content: chapter.content,
              slug: chapter.slug,
              price: chapter.price ?? 0,
              discount: chapter.discount ?? 0,
              bookId: createdBook.id,
            },
          });

          console.log(`[CHAPTER_${chapterIndex}_CREATED]`, createdChapter.id);

          // Step 3: Create Chapter Images
          for (let imageIndex = 0; imageIndex < chapterImages.length; imageIndex++) {
            const image = chapterImages[imageIndex];
            const caption = chapter.images?.[imageIndex]?.caption || null;

            console.log(`[CHAPTER_${chapterIndex}_IMAGE_${imageIndex}] Creating image`);

            await tx.chapterImage.create({
              data: {
                url: image.url,
                caption: caption,
                chapterId: createdChapter.id,
              },
            });
          }

          createdChapters.push(createdChapter);
        }

        // Fetch complete book with relations
        const bookWithRelations = await tx.book.findUnique({
          where: { id: createdBook.id },
          include: {
            chapters: {
              include: {
                images: true,
              },
            },
          },
        });

        console.log("[BOOK_CREATED_SUCCESSFULLY]", createdBook.id);
        
        // Add computed fields
        if (bookWithRelations) {
          bookWithRelations.chapters = applyComputedPricingToChapters(bookWithRelations.chapters) as any;
        }
        
        return bookWithRelations;
      });

      return book;
    } catch (error) {
      console.error("[BOOK_CREATE_ERROR]", error);
      throw new Error("Failed to create book with chapters");
    }
  }

  static async createBook(
    data: BookCreateInput,
    userId: string,
    authorName: string
  ) {
    try {
      const book = await prisma.book.create({
        data: {
          title: data.title,
          description: data.description,
          cover: data.cover,
          price: data.price ?? 0,
          author: authorName,
          ownerId: userId,
        },
        include: {
          chapters: {
            include: {
              images: true,
            },
          },
        },
      });

      return book;
    } catch (error) {
      console.error("[BookService] Create error:", error);
      throw new Error("Failed to create book");
    }
  }

  static async updateBookWithChapters(
    bookId: string,
    data: BookCreateInput,
    uploadedChapterImages: UploadedFile[][],
    userId: string,
    authorName: string
  ) {
    try {
      console.log("[BOOK_UPDATE_PAYLOAD]", JSON.stringify(data, null, 2));
      console.log("[UPLOADED_IMAGES_COUNT]", uploadedChapterImages.map((imgs) => imgs.length));

      const book = await prisma.$transaction(async (tx) => {
        // Step 1: Update Book
        const updatedBook = await tx.book.update({
          where: { id: bookId },
          data: {
            title: data.title,
            description: data.description,
            cover: data.cover,
            price: data.price ?? 0,
            author: authorName,
          },
        });

        console.log("[BOOK_UPDATED]", updatedBook.id);

        // Step 2: Delete existing chapters and images
        await tx.chapterImage.deleteMany({
          where: {
            chapter: {
              bookId: bookId,
            },
          },
        });

        await tx.chapter.deleteMany({
          where: { bookId: bookId },
        });

        console.log("[EXISTING_CHAPTERS_DELETED]");

        // Step 3: Create new Chapters sequentially
        const chapters = data.chapters || [];
        const createdChapters = [];

        for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
          const chapter = chapters[chapterIndex];
          const chapterImages = uploadedChapterImages[chapterIndex] || [];

          console.log(`[CHAPTER_${chapterIndex}] Creating chapter "${chapter.title}" with ${chapterImages.length} images`);

          const normalized = normalizeChapterPricing(chapter.isFree, chapter.price, chapter.discount);
          const createdChapter = await tx.chapter.create({
            data: {
              title: chapter.title,
              content: chapter.content,
              slug: chapter.slug,
              price: normalized.price,
              discount: normalized.discount,
              bookId: updatedBook.id,
            },
          });

          console.log(`[CHAPTER_${chapterIndex}_CREATED]`, createdChapter.id);

          // Step 4: Create Chapter Images
          for (let imageIndex = 0; imageIndex < chapterImages.length; imageIndex++) {
            const image = chapterImages[imageIndex];
            const caption = chapter.images?.[imageIndex]?.caption || null;

            console.log(`[CHAPTER_${chapterIndex}_IMAGE_${imageIndex}] Creating image`);

            await tx.chapterImage.create({
              data: {
                url: image.url,
                caption: caption,
                chapterId: createdChapter.id,
              },
            });
          }

          createdChapters.push(createdChapter);
        }

        // Fetch complete book with relations
        const bookWithRelations = await tx.book.findUnique({
          where: { id: updatedBook.id },
          include: {
            chapters: {
              include: {
                images: true,
              },
            },
          },
        });

        console.log("[BOOK_UPDATED_SUCCESSFULLY]", updatedBook.id);
        
        // Add computed fields
        if (bookWithRelations) {
          bookWithRelations.chapters = applyComputedPricingToChapters(bookWithRelations.chapters) as any;
        }
        
        return bookWithRelations;
      });

      return book;
    } catch (error) {
      console.error("[BOOK_UPDATE_ERROR]", error);
      throw new Error("Failed to update book with chapters");
    }
  }

  static async getBookById(bookId: string) {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        chapters: {
          include: {
            images: true,
          },
        },
      },
    });

    if (!book) return null;

    // Add computed fields
    book.chapters = applyComputedPricingToChapters(book.chapters) as any;

    return book;
  }

  static async getBooks() {
    const books = await prisma.book.findMany({
      include: {
        chapters: {
          include: {
            images: true,
          },
        },
      },
    });

    // Add computed fields
    return books.map(book => ({
      ...book,
      chapters: applyComputedPricingToChapters(book.chapters) as any,
    }));
  }

  static async verifyOwnership(bookId: string, userId: string): Promise<boolean> {
    const book = await this.getBookById(bookId);
    return book?.ownerId === userId;
  }
}
