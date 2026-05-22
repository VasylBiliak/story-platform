import { LimitsConfig } from './limits.types';

export const LIMITS: LimitsConfig = {
  FREE: {
    user: {
      maxBooks: 3,
    },
    ip: {
      maxUsersPerIp: 3,
    },
    chapter: {
      maxChaptersPerBook: 5,
      maxImagesPerChapter: 3,
    },
  },
  PRO: {
    user: {
      maxBooks: 100,
    },
    ip: {
      maxUsersPerIp: 100,
    },
    chapter: {
      maxChaptersPerBook: 100,
      maxImagesPerChapter: 20,
    },
  },
};
