import { prisma } from '@/server/prisma';
import { LIMITS, PlanType } from './limits.config';

export class LimitsService {
	static getPlan(userPlan: PlanType = 'FREE') {
		return LIMITS[userPlan];
	}

	// Count users by IP
	static async countUsersByIp(ip: string): Promise<number> {
		return prisma.user.count({ where: { ip } });
	}

	// Count books by user
	static async countBooksByUser(userId: string): Promise<number> {
		return prisma.book.count({ where: { ownerId: userId } });
	}

	// Get oldest book for user
	static async getOldestBookByUser(userId: string) {
		return prisma.book.findFirst({
			where: { ownerId: userId },
			orderBy: { createdAt: 'asc' },
		});
	}

	// Delete book by ID (with cascade)
	static async deleteBookById(bookId: string) {
		// Use book cleanup module for cascade
		const { deleteBookRelations } = await import('@/server/modules/books/book.cleanup');
		await deleteBookRelations(bookId);
		return prisma.book.delete({ where: { id: bookId } });
	}

	// Count chapters by book
	static async countChaptersByBook(bookId: string): Promise<number> {
		return prisma.chapter.count({ where: { bookId } });
	}

	// Get oldest chapter for book
	static async getOldestChapterByBook(bookId: string) {
		return prisma.chapter.findFirst({
			where: { bookId },
			orderBy: { createdAt: 'asc' },
		});
	}

	// Delete chapter by ID (with cascade)
	static async deleteChapterById(chapterId: string) {
		const { deleteChapterImages } = await import('@/server/modules/chapters/chapter.cleanup');
		await deleteChapterImages(chapterId);
		return prisma.chapter.delete({ where: { id: chapterId } });
	}

	// Count images by chapter
	static async countImagesByChapter(chapterId: string): Promise<number> {
		return prisma.chapterImage.count({ where: { chapterId } });
	}

	// Get oldest image for chapter
	static async getOldestImageByChapter(chapterId: string) {
		return prisma.chapterImage.findFirst({
			where: { chapterId },
			orderBy: { id: 'asc' },
		});
	}

	// Delete image by ID (with storage cleanup)
	static async deleteImageById(imageId: string) {
		const { deleteChapterImageWithStorage } = await import('@/server/modules/chapters/chapter.cleanup');
		await deleteChapterImageWithStorage(imageId);
	}
}
