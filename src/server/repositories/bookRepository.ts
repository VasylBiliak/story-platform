import { prisma } from "@/server/prisma";
import { Book, Chapter } from "@/lib/types";

export async function findAllBooks() {
  return prisma.book.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function findBookById(id: string) {
  return prisma.book.findUnique({
    where: { id },
    include: { chapters: true },
  });
}

export async function createBookWithChapters(userId: string, data: {
  title: string;
  description: string;
  cover: string;
  author: string;
  chapters: Array<{
    title: string;
    slug: string;
    content: string;
    isFree: boolean;
    price?: number;
    discount?: number;
    finalPrice?: number;
  }>;
}) {
  return prisma.book.create({
    data: {
      title: data.title,
      description: data.description,
      cover: data.cover,
      author: data.author,
      User: { connect: { id: userId } },
      chapters: {
        create: data.chapters.map((chapter) => ({
          title: chapter.title,
          slug: chapter.slug,
          content: chapter.content,
          isFree: chapter.isFree,
          price: chapter.price,
          discount: chapter.discount,
          finalPrice: chapter.finalPrice,
        })),
      },
    },
    include: { chapters: true },
  });
}

export async function updateBookWithChapters(bookId: string, data: {
  title: string;
  description: string;
  cover: string;
  chapters: Array<{
    id?: string;
    title: string;
    slug: string;
    content: string;
    isFree: boolean;
    price?: number;
    discount?: number;
    finalPrice?: number;
    images?: Array<{
      id?: string;
      url?: string;
      caption?: string;
      _delete?: boolean;
    }>;
  }>;
}) {
  return prisma.$transaction(async (tx) => {
    // Step 1: Update Book fields
    const updatedBook = await tx.book.update({
      where: { id: bookId },
      data: {
        title: data.title,
        description: data.description,
        cover: data.cover,
      },
    });

    // Step 2: Get existing chapters for synchronization
    const existingChapters = await tx.chapter.findMany({
      where: { bookId },
      include: { images: true },
    });

    // Step 3: Process chapters
    const incomingChapterIds = new Set<string>();
    const payloadChapters = data.chapters || [];

    for (const chapter of payloadChapters) {
      let chapterId: string;

      if (chapter.id) {
        // Update existing chapter
        incomingChapterIds.add(chapter.id);

        await tx.chapter.update({
          where: { id: chapter.id },
          data: {
            title: chapter.title,
            slug: chapter.slug,
            content: chapter.content,
            price: chapter.price,
            discount: chapter.discount,
          },
        });

        chapterId = chapter.id;
      } else {
        // Create new chapter
        const newChapter = await tx.chapter.create({
          data: {
            title: chapter.title,
            slug: chapter.slug,
            content: chapter.content,
            price: chapter.price,
            discount: chapter.discount,
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

      const incomingImageIds = new Set<string>();
      const chapterImages = chapter.images || [];

      for (const image of chapterImages) {
        if (image._delete) {
          // Skip deleted images (will be handled in cleanup)
          continue;
        }

        if (image.id) {
          // Update existing image
          incomingImageIds.add(image.id);

          await tx.chapterImage.update({
            where: { id: image.id },
            data: {
              url: image.url,
              caption: image.caption,
            },
          });
        } else if (image.url) {
          // Create new image
          await tx.chapterImage.create({
            data: {
              url: image.url,
              caption: image.caption,
              chapterId,
            },
          });
        }
      }

      // Step 5: Delete removed images
      const imagesToDelete = existingImages.filter(
        (img) => !incomingImageIds.has(img.id)
      );

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

    if (chaptersToDelete.length > 0) {
      await tx.chapter.deleteMany({
        where: {
          id: { in: chaptersToDelete.map((ch) => ch.id) },
        },
      });
    }

    // Step 7: Fetch complete book with relations
    return tx.book.findUnique({
      where: { id: updatedBook.id },
      include: {
        chapters: {
          include: {
            images: true,
          },
        },
      },
    });
  });
}

export async function deleteBookById(bookId: string) {
  return prisma.book.delete({ where: { id: bookId } });
}
