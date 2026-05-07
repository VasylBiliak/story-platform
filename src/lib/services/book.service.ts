import { prisma } from "@/server/prisma";
import type { BookCreateInput } from "@/lib/validators/book";

export class BookService {
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
