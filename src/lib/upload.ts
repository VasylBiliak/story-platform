import { randomUUID } from "crypto";

import { supabase } from "@/lib/supabase";
import type { UploadedFile } from "@/types";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const BUCKET_NAME = "book-images";

export function generateUniqueFilename(originalName: string): string {
  const ext = originalName.split(".").pop();

  return `${randomUUID()}.${ext}`;
}

export function validateFile(file: File): {
  valid: boolean;
  error?: string;
} {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(", ")}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${
        MAX_FILE_SIZE / 1024 / 1024
      }MB`,
    };
  }

  return {
    valid: true,
  };
}

export const UPLOAD_CONSTANTS = {
  ALLOWED_TYPES,
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_MB: MAX_FILE_SIZE / 1024 / 1024,
} as const;

async function uploadToSupabase(file: File): Promise<UploadedFile> {
  const filename = generateUniqueFilename(file.name);

  const bytes = await file.arrayBuffer();

  const buffer = Buffer.from(bytes);

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("[SUPABASE_UPLOAD_ERROR]", error);

    throw new Error(error.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename);

  return {
    filename,
    path: filename,
    url: publicUrl,
  };
}

export async function uploadFile(file: File): Promise<UploadedFile> {
  const validation = validateFile(file);

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return uploadToSupabase(file);
}

export async function uploadMultipleFiles(
  files: File[]
): Promise<UploadedFile[]> {
  return Promise.all(files.map(uploadFile));
}