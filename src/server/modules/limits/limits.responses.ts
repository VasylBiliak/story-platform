// Frontend-friendly API response builders for limits

export const LIMITS_RESPONSES = {
  bookLimitReached: (replacedBookId: string, createdBook: any) => ({
    message: 'Book limit reached. Your oldest book was replaced because this is a demo environment.',
    maxBooks: 3,
    replacedBookId,
    createdBook,
  }),

  chapterLimitReached: () => ({
    error: 'Chapter limit reached',
    message: 'Maximum number of chapters per book is 5.',
  }),

  imageLimitReached: () => ({
    error: 'Image limit reached',
    message: 'Maximum number of images per chapter is 3.',
  }),


  bookCreatedSuccessfully: (createdBook: any) => ({
    message: 'Book created successfully.',
    maxBooks: 3,
    createdBook,
  }),
};
