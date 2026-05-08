import { prisma } from "@/server/prisma";
import { applyComputedPricingToChapters, normalizeChapterPricing } from "@/server/services/pricingService";

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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

export async function getBookById(bookId: string) {
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

  if (!book) return null;

  return {
    ...book,
    chapters: applyComputedPricingToChapters(book.chapters),
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
        id?: string;
        url?: string;
        file?: File;
        caption?: string;
        _delete?: boolean;
      }>;
    }>;
  },
  uploadedChapterImages?: File[][]
) {
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

      // Step 4: Process chapter images
      const existingImages = await tx.chapterImage.findMany({
        where: { chapterId },
      });
      console.log(`[CHAPTER_${chapterIndex}_EXISTING_IMAGES]`, existingImages.length);

      const incomingImageIds = new Set<string>();
      const chapterImages = chapter.images || [];

      // Track uploaded file index
      let uploadedFileIndex = 0;

      for (let imageIndex = 0; imageIndex < chapterImages.length; imageIndex++) {
        const image = chapterImages[imageIndex];

        if (image._delete) {
          // Skip deleted images (will be handled in cleanup)
          console.log(`[CHAPTER_${chapterIndex}_IMAGE_${imageIndex}_SKIP_DELETE]`);
          continue;
        }

        if (image.id) {
          // Update existing image caption
          console.log(`[CHAPTER_${chapterIndex}_IMAGE_${imageIndex}_UPDATE]`, image.id);
          incomingImageIds.add(image.id);

          await tx.chapterImage.update({
            where: { id: image.id },
            data: {
              caption: image.caption || "",
            },
          });
        } else if (image.file && uploadedFileIndex < uploadedImages.length) {
          // Create new image from uploaded file
          const uploadedFile = uploadedImages[uploadedFileIndex];
          console.log(`[CHAPTER_${chapterIndex}_IMAGE_${imageIndex}_CREATE]`, uploadedFile.name);

          // Convert file to base64
          const base64 = await fileToBase64(uploadedFile);

          await tx.chapterImage.create({
            data: {
              url: base64,
              caption: image.caption || "",
              chapterId,
            },
          });

          uploadedFileIndex++;
        } else if (image.url) {
          // Create new image from URL (for legacy support)
          console.log(`[CHAPTER_${chapterIndex}_IMAGE_${imageIndex}_CREATE_URL]`);

          await tx.chapterImage.create({
            data: {
              url: image.url,
              caption: image.caption || "",
              chapterId,
            },
          });
        }
      }

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