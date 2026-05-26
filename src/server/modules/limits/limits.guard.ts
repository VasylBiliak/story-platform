import { LIMITS } from "./limits.config";
import { LimitsService } from "./limits.service";
import type { PlanType } from "./limits.types";
import { prisma } from "@/server/prisma";

// Checks book limit without deleting, returns user books if limit reached
export async function checkBookLimit(userId: string, plan: PlanType = 'FREE') {
	const maxBooks = LIMITS[plan].user.maxBooks;
	const count = await LimitsService.countBooksByUser(userId);
	if (count >= maxBooks) {
		// Get all user books for replacement selection
		const books = await prisma.book.findMany({
			where: { ownerId: userId },
			select: {
				id: true,
				title: true,
				cover: true,
				author: true,
				createdAt: true,
			},
			orderBy: { createdAt: 'desc' },
		});
		return {
			limitReached: true,
			maxBooks,
			books,
		};
	}
	return { limitReached: false, maxBooks };
}

// Handles book limit: deletes oldest if needed, returns info
export async function handleBookLimit(userId: string, plan: PlanType = 'FREE') {
	const maxBooks = LIMITS[plan].user.maxBooks;
	const count = await LimitsService.countBooksByUser(userId);
	if (count >= maxBooks) {
		const oldest = await LimitsService.getOldestBookByUser(userId);
		if (oldest) {
			// Save metadata before deletion
			const replacedBook = {
				id: oldest.id,
				title: oldest.title,
				cover: oldest.cover,
			};
			await LimitsService.deleteBookById(oldest.id);
			return {
				message: 'Book limit reached. Oldest book was removed because this is a demo environment.',
				replacedBook,
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
