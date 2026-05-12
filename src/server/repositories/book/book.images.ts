import { Prisma } from "@prisma/client";

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function replaceChapterImages(params: {
  tx: Prisma.TransactionClient;
  chapterId: string;
  chapterIndex: number;
  chapterImages?: Array<{
    url?: string;
    file?: File;
    caption?: string;
    _delete?: boolean;
  }>;
  uploadedImages?: File[];
}) {
  const { tx, chapterId, chapterIndex, chapterImages, uploadedImages } = params;

  console.log(
    `[CHAPTER_${chapterIndex}_IMAGES_REPLACE_START]`,
    chapterId
  );

  // Delete all existing images for chapter
  await tx.chapterImage.deleteMany({
    where: { chapterId },
  });

  console.log(
    `[CHAPTER_${chapterIndex}_IMAGES_DELETED_ALL]`
  );

  const images = chapterImages || [];

  // Track uploaded file index
  let uploadedFileIndex = 0;

  for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
    const image = images[imageIndex];

    if (image._delete) {
      console.log(
        `[CHAPTER_${chapterIndex}_IMAGE_${imageIndex}_SKIP_DELETE]`
      );
      continue;
    }

    // Create image from uploaded file
    if (image.file && uploadedFileIndex < (uploadedImages?.length || 0)) {
      const uploadedFile = uploadedImages![uploadedFileIndex];

      console.log(
        `[CHAPTER_${chapterIndex}_IMAGE_${imageIndex}_CREATE_FILE]`,
        uploadedFile.name
      );

      const base64 = await fileToBase64(uploadedFile);

      await tx.chapterImage.create({
        data: {
          url: base64,
          caption: image.caption || "",
          chapterId,
        },
      });

      uploadedFileIndex++;
      continue;
    }

    // Re-create existing image from URL
    if (image.url) {
      console.log(
        `[CHAPTER_${chapterIndex}_IMAGE_${imageIndex}_CREATE_URL]`
      );

      await tx.chapterImage.create({
        data: {
          url: image.url,
          caption: image.caption || "",
          chapterId,
        },
      });
    }
  }

  console.log(
    `[CHAPTER_${chapterIndex}_IMAGES_REPLACE_DONE]`
  );
}
