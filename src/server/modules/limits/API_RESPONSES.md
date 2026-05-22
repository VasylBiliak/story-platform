/**
 * API Response Examples for Limits Demo
 * 
 * These are the responses expected from the backend when creating books/chapters/images
 * and hitting demo limits.
 */

// ============================================
// BOOK CREATION - Success (No Limit Reached)
// ============================================
export const BOOK_CREATED_SUCCESS = {
  message: 'Book created successfully.',
  maxBooks: 3,
  createdBook: {
    id: 'book-123',
    title: 'My Book',
    description: 'A great book',
    cover: 'https://...',
    author: 'John Doe',
    chapters: [
      {
        id: 'chapter-1',
        title: 'Chapter 1',
        slug: 'chapter-1',
        content: 'Content...',
        isFree: true,
      },
    ],
  },
};

// ============================================
// BOOK CREATION - Limit Reached (Oldest Replaced)
// ============================================
export const BOOK_LIMIT_REACHED = {
  message: 'Book limit reached. Your oldest book was replaced because this is a demo environment.',
  maxBooks: 3,
  replacedBookId: 'old-book-id',
  createdBook: {
    id: 'new-book-id',
    title: 'New Book',
    description: 'A great new book',
    cover: 'https://...',
    author: 'Jane Doe',
    chapters: [],
  },
};

// ============================================
// CHAPTER CREATION - Chapter Limit Error
// ============================================
export const CHAPTER_LIMIT_ERROR = {
  error: 'Chapter limit reached',
  message: 'Maximum number of chapters per book is 5.',
};

// ============================================
// IMAGE UPLOAD - Image Limit Error
// ============================================
export const IMAGE_LIMIT_ERROR = {
  error: 'Image limit reached',
  message: 'Maximum number of images per chapter is 3.',
};

// ============================================
// REGISTRATION - IP Limit Error
// ============================================
export const IP_LIMIT_ERROR = {
  error: 'IP limit reached',
  message: 'This demo allows only 3 accounts per IP address.',
};
