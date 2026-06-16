/**
 * Shared authentication validation constants
 * Used by both frontend and backend to ensure consistency
 */

export const AUTH_LIMITS = {
  PSEUDONYM_MAX_LENGTH: 36,
  EMAIL_MAX_LENGTH: 36,
  PASSWORD_MAX_LENGTH: 48,
  PASSWORD_MIN_LENGTH: 8,
} as const;

export const AUTH_ERROR_CODES = {
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  PSEUDONYM_ALREADY_EXISTS: 'PSEUDONYM_ALREADY_EXISTS',
  EMAIL_TOO_LONG: 'EMAIL_TOO_LONG',
  PSEUDONYM_TOO_LONG: 'PSEUDONYM_TOO_LONG',
  PASSWORD_TOO_LONG: 'PASSWORD_TOO_LONG',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
} as const;

export const AUTH_ERROR_MESSAGES = {
  [AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS]: 'An account with this email already exists.',
  [AUTH_ERROR_CODES.PSEUDONYM_ALREADY_EXISTS]: 'This pseudonym is already taken.',
  [AUTH_ERROR_CODES.EMAIL_TOO_LONG]: 'Email cannot exceed 36 characters.',
  [AUTH_ERROR_CODES.PSEUDONYM_TOO_LONG]: 'Pseudonym cannot exceed 36 characters.',
  [AUTH_ERROR_CODES.PASSWORD_TOO_LONG]: 'Password cannot exceed 48 characters.',
  [AUTH_ERROR_CODES.INVALID_EMAIL]: 'Invalid email format.',
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password.',
} as const;
