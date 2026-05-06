import { prisma } from "@/server/prisma";

export async function getBooks() {
  return prisma.book.findMany({
    include: {
      chapters: true,
    },
  });
}

export async function getBookById(bookId: string) {
  return prisma.book.findUnique({
    where: { id: bookId },
    include: {
      chapters: true,
    },
  });
}

export async function createBook(userId: string, payload: {
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
      title: payload.title,
      description: payload.description,
      cover: payload.cover,
      author: payload.author,
      ownerId: userId,
      chapters: {
        create: payload.chapters,
      },
    },
  });
}

export async function updateBook(bookId: string, payload: {
  title: string;
  description: string;
  cover: string;
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
  return prisma.book.update({
    where: { id: bookId },
    data: {
      title: payload.title,
      description: payload.description,
      cover: payload.cover,
      chapters: {
        deleteMany: {},
        create: payload.chapters,
      },
    },
  });
}

export async function deleteBook(bookId: string) {
  return prisma.book.delete({
    where: { id: bookId },
  });
}
