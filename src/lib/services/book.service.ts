import { prisma } from "@/server/prisma";
import type { BookCreateInput } from "@/lib/validators/book";
import type { UploadedFile } from "@/types";
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
      console.log("[BOOK_UPDATE_START]", { bookId, chaptersCount: data.chapters?.length });
      console.log("[BOOK_UPDATE_PAYLOAD]", JSON.stringify(data, null, 2));
      console.log("[UPLOADED_IMAGES_COUNT]", uploadedChapterImages.map((imgs) => imgs.length));

      const book = await prisma.$transaction(async (tx) => {
        // Step 1: Update Book fields
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

        // Step 2: Get existing chapters for synchronization
        const existingChapters = await tx.chapter.findMany({
          where: { bookId },
          include: { images: true },
        });
        console.log("[EXISTING_CHAPTERS_COUNT]", existingChapters.length);

        // Step 3: Process chapters
        const incomingChapterIds = new Set<string>();
        const payloadChapters = data.chapters || [];

        for (let chapterIndex = 0; chapterIndex < payloadChapters.length; chapterIndex++) {
          const chapter = payloadChapters[chapterIndex];
          const uploadedImages = uploadedChapterImages[chapterIndex] || [];

          console.log(`[CHAPTER_${chapterIndex}] Processing chapter "${chapter.title}", id: ${chapter.id || "NEW"}`);
          console.log(`[CHAPTER_${chapterIndex}] Images in payload: ${chapter.images?.length || 0}`);
          console.log(`[CHAPTER_${chapterIndex}] Uploaded files: ${uploadedImages.length}`);

          let chapterId: string;

          if (chapter.id) {
            // Update existing chapter
            console.log(`[CHAPTER_${chapterIndex}_UPDATE]`, chapter.id);
            incomingChapterIds.add(chapter.id);

            const normalized = normalizeChapterPricing(chapter.isFree, chapter.price, chapter.discount);

            await tx.chapter.update({
              where: { id: chapter.id },
              data: {
                title: chapter.title,
                slug: chapter.slug,
                content: chapter.content,
                price: normalized.price,
                discount: normalized.discount,
              },
            });

            chapterId = chapter.id;
          } else {
            // Create new chapter
            console.log(`[CHAPTER_${chapterIndex}_CREATE]`, chapter.title);

            const normalized = normalizeChapterPricing(chapter.isFree, chapter.price, chapter.discount);

            const newChapter = await tx.chapter.create({
              data: {
                title: chapter.title,
                slug: chapter.slug,
                content: chapter.content,
                price: normalized.price,
                discount: normalized.discount,
                bookId: updatedBook.id,
              },
            });

            chapterId = newChapter.id;
            incomingChapterIds.add(chapterId);
          }

          // Step 4: Process chapter images - SAFE RECONCILIATION
          const existingImages = await tx.chapterImage.findMany({
            where: { chapterId },
          });
          console.log(`[CHAPTER_${chapterIndex}_EXISTING_IMAGES]`, existingImages.length);

          // Build map of existing DB images for O(1) lookup
          const existingImagesMap = new Map(existingImages.map(img => [img.id, img]));

          const incomingImageIds = new Set<string>();
          const chapterImages = chapter.images || [];

          // Classification counters for debug logging
          let imagesToCreate = 0;
          let imagesToUpdate = 0;
          let imagesToSkip = 0;
          let imagesToDeleteMarked = 0;

          // Track uploaded file index
          let uploadedFileIndex = 0;

          for (let imageIndex = 0; imageIndex < chapterImages.length; imageIndex++) {
            const image = chapterImages[imageIndex];

            if (image._delete) {
              // Mark for deletion - don't add to incomingImageIds
              console.log(`[CHAPTER_${chapterIndex}_IMAGE_${imageIndex}_DELETE_MARKED]`, image.id || "no-id");
              imagesToDeleteMarked++;
              continue;
            }

            if (image.id) {
              // SAFE UPDATE: Only update if image exists in DB
              const existing = existingImagesMap.get(image.id);

              if (!existing) {
                // Image ID from frontend doesn't exist in DB - skip safely
                console.log(`[CHAPTER_${chapterIndex}_IMAGE_${imageIndex}_SKIP_MISSING_DB]`, image.id);
                imagesToSkip++;
                continue;
              }

              // Image exists - safe to update caption
              console.log(`[CHAPTER_${chapterIndex}_IMAGE_${imageIndex}_UPDATE]`, image.id);
              await tx.chapterImage.update({
                where: { id: image.id },
                data: {
                  caption: image.caption || "",
                },
              });

              incomingImageIds.add(image.id);
              imagesToUpdate++;
            } else if (image.file && uploadedFileIndex < uploadedImages.length) {
              // Create new image from uploaded file
              const uploadedFile = uploadedImages[uploadedFileIndex];
              console.log(`[CHAPTER_${chapterIndex}_IMAGE_${imageIndex}_CREATE_FILE]`, uploadedFile.filename);

              await tx.chapterImage.create({
                data: {
                  url: uploadedFile.url,
                  caption: image.caption || "",
                  chapterId,
                },
              });

              uploadedFileIndex++;
              imagesToCreate++;
            } else if (image.url) {
              // Create new image from URL (for legacy support)
              console.log(`[CHAPTER_${chapterIndex}_IMAGE_${imageIndex}_CREATE_URL]`, image.url.substring(0, 50) + "...");

              await tx.chapterImage.create({
                data: {
                  url: image.url,
                  caption: image.caption || "",
                  chapterId,
                },
              });

              imagesToCreate++;
            }
          }

          // Log classification summary
          console.log(`[CHAPTER_${chapterIndex}_IMAGE_SYNC_SUMMARY]`, {
            existing: existingImages.length,
            create: imagesToCreate,
            update: imagesToUpdate,
            skip: imagesToSkip,
            deleteMarked: imagesToDeleteMarked,
            keep: incomingImageIds.size,
          });

          // Step 5: Delete removed images
          const imagesToDelete = existingImages.filter(
            (img) => !incomingImageIds.has(img.id)
          );
          console.log(`[CHAPTER_${chapterIndex}_IMAGES_DELETE]`, imagesToDelete.length);

          if (imagesToDelete.length > 0) {
            await tx.chapterImage.deleteMany({
              where: {
                id: { in: imagesToDelete.map((img) => img.id) },
              },
            });
          }
        }

        // Step 6: Delete removed chapters
        const chaptersToDelete = existingChapters.filter(
          (ch) => !incomingChapterIds.has(ch.id)
        );
        console.log("[CHAPTERS_DELETE]", chaptersToDelete.length);

        if (chaptersToDelete.length > 0) {
          await tx.chapter.deleteMany({
            where: {
              id: { in: chaptersToDelete.map((ch) => ch.id) },
            },
          });
        }

        // Step 7: Fetch complete book with relations
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
