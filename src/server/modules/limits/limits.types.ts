// Types for the limits system

export type PlanType = 'FREE' | 'PRO';

export interface UserLimits {
  maxBooks: number;
}


export interface ChapterLimits {
  maxChaptersPerBook: number;
  maxImagesPerChapter: number;
}

  user: UserLimits;
  chapter: ChapterLimits;
}

export type LimitsConfig = Record<PlanType, PlanLimits>;
