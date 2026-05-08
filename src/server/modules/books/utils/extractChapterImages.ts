/**
 * Extracts uploaded chapter image files from FormData
 */

export function extractChapterImages(
  formData: FormData,
  chapters: any[]
): File[][] {
  return chapters.map((chapter: any, chapterIndex: number) => {
    const images: File[] = [];
    const chapterImages = chapter.images || [];

    for (let imageIndex = 0; imageIndex < chapterImages.length; imageIndex++) {
      const file = formData.get(`chapterImages_${chapterIndex}_${imageIndex}`);

      if (file instanceof File && file.size > 0) {
        images.push(file);
      }
    }

    return images;
  });
}
