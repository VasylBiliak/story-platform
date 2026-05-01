"use client";

import React, { forwardRef } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  showCharacterCount?: boolean;
  maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      showCharacterCount = false,
      maxLength,
      className = "",
      value,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const characterCount = typeof value === "string" ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm text-text-secondary mb-1">
            {label}
            {props.required && <span className="text-accent-primary ml-1">*</span>}
            {showCharacterCount && maxLength && (
              <span className="text-text-tertiary ml-1">
                ({characterCount}/{maxLength})
              </span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          rows={rows}
          className={`
            w-full px-3 py-2 bg-bg-primary border rounded-md text-text-primary 
            placeholder-text-tertiary outline-none transition resize-vertical
            focus:border-accent-primary
            ${error ? "border-error focus:border-error" : "border-border"}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-text-tertiary">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
