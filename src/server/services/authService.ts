//src/server/services/authService.ts

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/server/prisma";
import { AUTH_ERROR_CODES, AUTH_ERROR_MESSAGES } from "@/lib/constants/auth";
import { sanitizeEmail, sanitizePseudonym, sanitizePassword } from "@/lib/utils/sanitize";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

type AuthResponse = {
  user: { id: string; email: string; name?: string | null };
  token: string;
};

// =========================
// REGISTER
// =========================
export async function registerUser(
  email: string,
  password: string,
  name?: string
): Promise<AuthResponse> {
  // Sanitize inputs
  const sanitizedEmail = sanitizeEmail(email);
  const sanitizedPassword = sanitizePassword(password);
  const sanitizedName = name ? sanitizePseudonym(name) : "";

  console.log("[AUTH] Registration attempt for email:", sanitizedEmail);

  // Check for duplicate email
  const existingEmailUser = await prisma.user.findUnique({
    where: { email: sanitizedEmail },
  });

  if (existingEmailUser) {
    console.log("[AUTH] Registration failed: Email already exists");
    const error = new Error(AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS]);
    (error as any).code = AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS;
    throw error;
  }

  // Check for duplicate pseudonym
  if (sanitizedName) {
    const existingPseudonymUser = await prisma.user.findFirst({
      where: { name: sanitizedName },
    });

    if (existingPseudonymUser) {
      console.log("[AUTH] Registration failed: Pseudonym already taken");
      const error = new Error(AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.PSEUDONYM_ALREADY_EXISTS]);
      (error as any).code = AUTH_ERROR_CODES.PSEUDONYM_ALREADY_EXISTS;
      throw error;
    }
  }

  const hashedPassword = await bcrypt.hash(sanitizedPassword, 10);

  const user = await prisma.user.create({
    data: {
      email: sanitizedEmail,
      password: hashedPassword,
      name: sanitizedName,
    },
  });

  console.log("[AUTH] Registration successful for user:", user.id);

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token,
  };
}

// =========================
// LOGIN
// =========================
export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  // Sanitize inputs
  const sanitizedEmail = sanitizeEmail(email);
  const sanitizedPassword = sanitizePassword(password);

  console.log("[AUTH] Login attempt for email:", sanitizedEmail);

  const user = await prisma.user.findUnique({
    where: { email: sanitizedEmail },
  });

  if (!user) {
    console.log("[AUTH] Login failed: User not found");
    const error = new Error(AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.INVALID_CREDENTIALS]);
    (error as any).code = AUTH_ERROR_CODES.INVALID_CREDENTIALS;
    throw error;
  }

  const isValid = await bcrypt.compare(sanitizedPassword, user.password);

  if (!isValid) {
    console.log("[AUTH] Login failed: Invalid password");
    const error = new Error(AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.INVALID_CREDENTIALS]);
    (error as any).code = AUTH_ERROR_CODES.INVALID_CREDENTIALS;
    throw error;
  }

  console.log("[AUTH] Login successful for user:", user.id);

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token,
  };
}