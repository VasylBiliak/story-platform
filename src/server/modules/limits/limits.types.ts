// Types for the limits system

export type PlanType = 'FREE' | 'PRO';

export interface UserLimits {
  maxBooks: number;
}

export interface IpLimits {
  maxUsersPerIp: number;
}

export interface ChapterLimits {
  maxChaptersPerBook: number;
  maxImagesPerChapter: number;
}

export interface PlanLimits {
  user: UserLimits;
  ip: IpLimits;
  chapter: ChapterLimits;
}

export type LimitsConfig = Record<PlanType, PlanLimits>;
