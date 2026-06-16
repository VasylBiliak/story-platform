/**
 * Input sanitization utilities
 * Used to clean and validate user input before storage
 */

/**
 * Sanitize a string by trimming whitespace and removing dangerous characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Trim leading and trailing whitespace
  let sanitized = input.trim();
  
  // Remove control characters (except newlines, tabs, etc. if needed)
  // This removes null bytes, control characters that could be used in attacks
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Normalize multiple spaces to single space
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  return sanitized;
}

/**
 * Sanitize email (trim and lowercase for consistency)
 */
export function sanitizeEmail(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return sanitizeString(input.toLowerCase());
}

/**
 * Sanitize pseudonym (trim and preserve case)
 */
export function sanitizePseudonym(input: string): string {
  return sanitizeString(input);
}

/**
 * Sanitize password (trim only, preserve case and special characters)
 */
export function sanitizePassword(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Only trim, don't modify the password content
  return input.trim();
}
