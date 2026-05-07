import { prisma } from "@/server/prisma";
import type { BookCreateInput } from "@/lib/validators/book";
import type { UploadedFile } from "@/lib/upload";

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
        const book = await tx.book.create({
          data: {
            title: data.title,
            description: data.description,
            cover: data.cover,
            price: data.price ?? 0,
            author: authorName,
            ownerId: userId,
            chapters: data.chapters && data.chapters.length > 0
              ? {
                  create: data.chapters.map((chapter, index) => {
                    const chapterImages = uploadedChapterImages[index] || [];
                    console.log(`[CHAPTER_${index}] Creating chapter "${chapter.title}" with ${chapterImages.length} images`);

                    return {
                      title: chapter.title,
                      content: chapter.content,
                      slug: chapter.slug,
                      price: chapter.price ?? 0,
                      discount: chapter.discount ?? 0,
                      images: chapterImages.length > 0
                        ? {
                            create: chapterImages.map((img, imgIndex) => ({
                              url: img.url,
                              caption: chapter.images?.[imgIndex]?.caption || null,
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

        console.log("[BOOK_CREATED_SUCCESSFULLY]", book.id);
        return book;
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

  static async getBookById(bookId: string) {
    return prisma.book.findUnique({
      where: { id: bookId },
      include: {
        chapters: {
          include: {
            images: true,
          },
        },
      },
    });
  }

  static async getBooks() {
    return prisma.book.findMany({
      include: {
        chapters: {
          include: {
            images: true,
          },
        },
      },
    });
  }

  static async verifyOwnership(bookId: string, userId: string): Promise<boolean> {
    const book = await this.getBookById(bookId);
    return book?.ownerId === userId;
  }
}
