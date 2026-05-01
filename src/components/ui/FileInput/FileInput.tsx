"use client";

import React, { useCallback } from "react";
import { validateImage } from "@/lib/sanitize";

interface FileInputProps {
  onFileSelect: (base64: string) => void;
  accept?: string;
  maxFiles?: number;
  currentFiles?: number;
  label?: string;
  helperText?: string;
  placeholder?: string;
  className?: string;
}

export function FileInput({
  onFileSelect,
  accept = "image/png,image/jpeg,image/webp",
  maxFiles = 1,
  currentFiles = 0,
  label,
  helperText,
  placeholder = "+ Upload image",
  className = "",
}: FileInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      const validation = validateImage(file);

      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onFileSelect(reader.result as string);
      };
      reader.onerror = () => {
        alert("Failed to process image");
      };
      reader.readAsDataURL(file);
    },
    [onFileSelect]
  );

  const isDisabled = currentFiles >= maxFiles;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm text-text-secondary mb-1">
          {label}
          {maxFiles > 1 && (
            <span className="text-text-tertiary ml-1">
              ({currentFiles}/{maxFiles})
            </span>
          )}
        </label>
      )}
      <label
        className={`
          block w-full px-3 py-3 border border-dashed border-border rounded-md 
          text-text-secondary text-center text-sm transition cursor-pointer
          hover:border-accent-primary hover:text-text-primary
          ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
          disabled={isDisabled}
        />
        {placeholder}
      </label>
      {helperText && <p className="mt-1 text-sm text-text-tertiary">{helperText}</p>}
    </div>
  );
}
