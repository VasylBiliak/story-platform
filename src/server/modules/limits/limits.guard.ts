import { AppError } from '@/server/core/errors/AppError';
import { LimitsService } from './limits.service';
import { LIMITS, PlanType } from './limits.config';

// Throws if IP limit exceeded
export async function ensureIpLimit(ip: string, plan: PlanType = 'FREE') {
	const maxUsers = LIMITS[plan].ip.maxUsersPerIp;
	const count = await LimitsService.countUsersByIp(ip);
	if (count >= maxUsers) {
		throw new AppError(
			'This demo allows only 3 accounts per IP address.',
			403,
			'IP_LIMIT_REACHED'
		);
	}
}

// Handles book limit: deletes oldest if needed, returns info
export async function handleBookLimit(userId: string, plan: PlanType = 'FREE') {
	const maxBooks = LIMITS[plan].user.maxBooks;
	const count = await LimitsService.countBooksByUser(userId);
	if (count >= maxBooks) {
		const oldest = await LimitsService.getOldestBookByUser(userId);
		if (oldest) {
			await LimitsService.deleteBookById(oldest.id);
			return {
				message: 'Book limit reached. Oldest book was removed because this is a demo environment.',
				removedBookId: oldest.id,
			};
		}
	}
	return null;
}

// Handles chapter limit: deletes oldest if needed, returns info
export async function handleChapterLimit(bookId: string, plan: PlanType = 'FREE') {
	const maxChapters = LIMITS[plan].chapter.maxChaptersPerBook;
	const count = await LimitsService.countChaptersByBook(bookId);
	if (count >= maxChapters) {
		const oldest = await LimitsService.getOldestChapterByBook(bookId);
		if (oldest) {
			await LimitsService.deleteChapterById(oldest.id);
			return {
				message: 'Chapter limit reached. Oldest chapter was removed because this is a demo environment.',
				removedChapterId: oldest.id,
			};
		}
	}
	return null;
}

// Handles chapter image limit: deletes oldest if needed, returns info
export async function handleChapterImageLimit(chapterId: string, plan: PlanType = 'FREE') {
	const maxImages = LIMITS[plan].chapter.maxImagesPerChapter;
	const count = await LimitsService.countImagesByChapter(chapterId);
	if (count >= maxImages) {
		const oldest = await LimitsService.getOldestImageByChapter(chapterId);
		if (oldest) {
			await LimitsService.deleteImageById(oldest.id);
			return {
				message: 'Image limit reached. Oldest image was removed because this is a demo environment.',
				removedImageId: oldest.id,
			};
		}
	}
	return null;
}
