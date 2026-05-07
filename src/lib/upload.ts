import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export interface UploadedFile {
  filename: string;
  url: string;
  path: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

export async function ensureUploadDir(): Promise<void> {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = originalName.split(".").pop();
  return `${timestamp}-${random}.${ext}`;
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(", ")}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

export async function uploadFile(file: File): Promise<UploadedFile> {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  await ensureUploadDir();

  const filename = generateUniqueFilename(file.name);
  const filepath = join(UPLOAD_DIR, filename);
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(filepath, buffer);

  const url = `/uploads/${filename}`;

  return {
    filename,
    url,
    path: filepath,
  };
}

export async function uploadMultipleFiles(files: File[]): Promise<UploadedFile[]> {
  const uploadPromises = files.map((file) => uploadFile(file));
  return Promise.all(uploadPromises);
}
