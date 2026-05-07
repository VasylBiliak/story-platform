import { prisma } from "@/server/prisma";

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
    chapters: book.chapters.map((chapter) => ({
      ...chapter,
    })),
  }));
}

export async function getBookById(bookId: string) {
  return prisma.book.findUnique({
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
      isFree: boolean;
      price?: number;
      discount?: number;
      images?: Array<{
        url: string;
        caption?: string;
      }>;
    }>;
  }
) {
  return prisma.book.create({
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
              const price = chapter.isFree ? 0 : chapter.price ?? 0;
              const discount = chapter.isFree ? 0 : chapter.discount ?? 0;

              return {
                title: chapter.title,
                slug: chapter.slug,
                content: chapter.content,
                isFree: chapter.isFree,
                price,
                discount,

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
}

export async function updateBook(
  bookId: string,
  payload: {
    title: string;
    description: string;
    cover: string;
    price?: number;
    chapters?: Array<{
      title: string;
      slug: string;
      content: string;
      isFree: boolean;
      price?: number;
      discount?: number;
      images?: Array<{
        url: string;
        caption?: string;
      }>;
    }>;
  }
) {
  return prisma.book.update({
    where: {
      id: bookId,
    },
    data: {
      title: payload.title,
      description: payload.description,
      cover: payload.cover,
      price: payload.price ?? 0,

      chapters: payload.chapters
        ? {
            deleteMany: {},

            create: payload.chapters.map((chapter) => {
              const price = chapter.isFree ? 0 : chapter.price ?? 0;
              const discount = chapter.isFree ? 0 : chapter.discount ?? 0;

              return {
                title: chapter.title,
                slug: chapter.slug,
                content: chapter.content,
                isFree: chapter.isFree,
                price,
                discount,

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
}

export async function deleteBook(bookId: string) {
  return prisma.book.delete({
    where: {
      id: bookId,
    },
  });
}