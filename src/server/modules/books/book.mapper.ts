/**
 * Maps validated data to service layer format
 */

import { BookCreateInput } from "@/lib/validators/book";

/**
 * Transform validated data for create operation (removes update-specific fields)
 */
export function mapToCreatePayload(data: BookCreateInput, author: string) {
  return {
    title: data.title,
    description: data.description,
    cover: data.cover,
    price: data.price,
    author,
    chapters: data.chapters?.map(chapter => ({
      title: chapter.title,
      slug: chapter.slug,
      content: chapter.content,
      isFree: chapter.isFree,
      price: chapter.price,
      discount: chapter.discount,
      images: chapter.images?.map(img => ({
        url: img.url || "",
        caption: img.caption,
      })),
    })),
  };
}

/**
 * Transform validated data for update operation (keeps update-specific fields)
 */
export function mapToUpdatePayload(data: BookCreateInput) {
  return {
    title: data.title,
    description: data.description,
    cover: data.cover,
    price: data.price,
    chapters: data.chapters,
  };
}
