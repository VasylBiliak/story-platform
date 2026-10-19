import { LimitsConfig } from './limits.types';

export const LIMITS: LimitsConfig = {
  FREE: {
    user: {
      maxBooks: 3,
    },
    chapter: {
      maxChaptersPerBook: 3,
      maxImagesPerChapter: 3,
    },
  },
  CREATOR: {
    user: {
      maxBooks: 10,
    },
    chapter: {
      maxChaptersPerBook: 20,
      maxImagesPerChapter: 10,
    },
  },
  AUTHOR: {
    user: {
      maxBooks: 100,
    },
    chapter: {
      maxChaptersPerBook: 100,
      maxImagesPerChapter: 20,
    },
  },
};
