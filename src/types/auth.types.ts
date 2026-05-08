/**
 * Authentication-related type definitions
 */

export type JwtPayload = {
  userId: string;
  email: string;
};

export type AuthUser = {
  userId: string;
  email: string;
};

export type User = {
  name: string;
  email: string;
};

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
};
