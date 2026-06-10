import { prisma } from "@/server/prisma";
import { applyComputedPricing, applyComputedPricingToChapters, normalizeChapterPricing } from "@/server/services/pricingService";
import { replaceChapterImages } from "@/server/repositories/book/book.images";
import { PaginationParams, PaginatedResponse } from "@/types";

export async function getBooks() {
  const books = await prisma.book.findMany({
    include: {
      chapters: {
        include: {
          images: true,
        },
      },
    },
  });

  return books.map((book) => ({
    ...book,
    chapters: applyComputedPricingToChapters(book.chapters),
  }));
}

export async function getBooksWithPagination(params: PaginationParams = {}): Promise<PaginatedResponse<any>> {
  const { findBooksWithPagination } = await import("@/server/repositories/bookRepository");
  const { books, pagination } = await findBooksWithPagination(params);

  // Fetch chapters for each book
  const booksWithChapters = await Promise.all(
    books.map(async (book) => {
      const bookWithChapters = await prisma.book.findUnique({
        where: { id: book.id },
        include: {
          chapters: {
            include: {
              images: true,
            },
          },
        },
      });

      if (!bookWithChapters) return book;

      return {
        ...bookWithChapters,
        chapters: applyComputedPricingToChapters(bookWithChapters.chapters),
      };
    })
  );

  return {
    data: booksWithChapters,
    pagination,
  };
}

export async function getBookById(bookId: string, userId?: string) {
  console.log("[BookService] ===== getBookById called =====");
  console.log("[BookService] bookId:", bookId);
  console.log("[BookService] userId:", userId);
  
  const book = await prisma.book.findUnique({
    where: {
      id: bookId,
    },
    include: {
      chapters: {
        include: {
          images: true,
        },
      },
    },
  });

  if (!book) {
    console.log("[BookService] Book not found:", bookId);
    return null;
  }

  console.log("[BookService] Book found:", book.title);
  console.log("[BookService] Number of chapters:", book.chapters.length);

  // Apply access control to chapters
  const chaptersWithAccess = await Promise.all(
    book.chapters.map(async (chapter) => {
      let purchased = false;
      if (userId && chapter.price > 0) {
        try {
          console.log("[BookService] Checking ownership for chapter:", chapter.id, "userId:", userId);
          const purchase = await prisma.chapterPurchase.findUnique({
            where: {
              userId_chapterId: {
                userId,
                chapterId: chapter.id,
              },
            },
          });
          purchased = purchase !== null;
          console.log("[BookService] Chapter ownership check result:", chapter.id, purchased);
          if (purchase) {
            console.log("[BookService] Purchase record found:", {
              id: purchase.id,
              userId: purchase.userId,
              chapterId: purchase.chapterId,
              createdAt: purchase.createdAt,
            });
          }
        } catch (error) {
          console.error("[BookService] Error checking chapter ownership:", error);
          console.error("[BookService] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
          purchased = false;
        }
      }

      const chapterWithPricing = applyComputedPricing(chapter) as any;
      chapterWithPricing.purchased = purchased;

      console.log("[BookService] Chapter:", chapter.id, "price:", chapter.price, "purchased:", purchased);

      // Apply access control: remove content for paid chapters not purchased
      const isFree = chapter.price === 0;
      if (!isFree && !purchased) {
        chapterWithPricing.content = "";
        console.log("[BookService] Content removed for unpaid chapter:", chapter.id);
      }

      return chapterWithPricing;
    })
  );

  console.log("[BookService] ===== getBookById completed =====");
  return {
    ...book,
    chapters: chaptersWithAccess,
  };
}

export async function createBook(
  userId: string,
  payload: {
    title: string;
    description: string;
    cover: string;
    author: string;
    price?: number;
    chapters?: Array<{
      title: string;
      slug: string;
      content: string;
      isFree?: boolean;
      price?: number;
      discount?: number;
      images?: Array<{
        url: string;
        caption?: string;
      }>;
    }>;
  }
) {
  const book = await prisma.book.create({
    data: {
      title: payload.title,
      description: payload.description,
      cover: payload.cover,
      author: payload.author,
      price: payload.price ?? 0,
      ownerId: userId,

      chapters: payload.chapters
        ? {
          create: payload.chapters.map((chapter) => {
            const normalized = normalizeChapterPricing(chapter.isFree, chapter.price, chapter.discount);

            return {
              title: chapter.title,
              slug: chapter.slug,
              content: chapter.content,
              price: normalized.price,
              discount: normalized.discount,
              images: chapter.images
                ? {
                  create: chapter.images.map((img) => ({
                    url: img.url,
                    caption: img.caption || "",
                  })),
                }
                : undefined,
            };
          }),
        }
        : undefined,
    },
    include: {
      chapters: {
        include: {
          images: true,
        },
      },
    },
  });

  // Add computed fields to response
  return {
    ...book,
    chapters: applyComputedPricingToChapters(book.chapters),
  };
}

export async function updateBook(
  bookId: string,
  payload: {
    title: string;
    description: string;
    cover: string;
    price?: number;
    chapters?: Array<{
      id?: string;
      title: string;
      slug: string;
      content: string;
      isFree?: boolean;
      price?: number;
      discount?: number;
      images?: Array<{
        url?: string;
        file?: File;
        caption?: string;
      }>;
    }>;
  },
  uploadedChapterImages?: File[][]
) {
  console.log("[BOOK_UPDATE_START]", { bookId, chaptersCount: payload.chapters?.length });
  console.log("[BOOK_UPDATE_PAYLOAD]", JSON.stringify(payload, null, 2));
  console.log("[UPLOADED_IMAGES_COUNT]", uploadedChapterImages?.map((imgs) => imgs.length));

  const book = await prisma.$transaction(async (tx) => {
    // Step 1: Update Book fields
    const updatedBook = await tx.book.update({
      where: {
        id: bookId,
      },
      data: {
        title: payload.title,
        description: payload.description,
        cover: payload.cover,
        price: payload.price ?? 0,
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
    const payloadChapters = payload.chapters || [];

    for (let chapterIndex = 0; chapterIndex < payloadChapters.length; chapterIndex++) {
      const chapter = payloadChapters[chapterIndex];
      const uploadedImages = uploadedChapterImages?.[chapterIndex] || [];

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

      // Step 4: Replace chapter images completely
      await replaceChapterImages({
        tx,
        chapterId,
        chapterIndex,
        chapterImages: chapter.images,
        uploadedImages,
      });
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
    return bookWithRelations;
  });

  // Add computed fields to response
  if (!book) {
    throw new Error("Book not found after update");
  }

  return {
    ...book,
    chapters: applyComputedPricingToChapters(book.chapters) as any,
  };
}

export async function deleteBook(bookId: string) {
  return prisma.book.delete({
    where: {
      id: bookId,
    },
  });
}