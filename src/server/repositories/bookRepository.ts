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
    title: string;
    slug: string;
    content: string;
    isFree: boolean;
    price?: number;
    discount?: number;
    finalPrice?: number;
  }>;
}) {
  await prisma.chapter.deleteMany({ where: { bookId } });

  return prisma.book.update({
    where: { id: bookId },
    data: {
      title: data.title,
      description: data.description,
      cover: data.cover,
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

export async function deleteBookById(bookId: string) {
  return prisma.book.delete({ where: { id: bookId } });
}
