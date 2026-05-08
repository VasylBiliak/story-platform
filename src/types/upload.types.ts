/**
 * Upload-related type definitions
 */

export interface UploadedFile {
  filename: string;
  url: string;
  path: string;
}

export interface ParsedChapterImages {
  [chapterIndex: string]: File[];
}
