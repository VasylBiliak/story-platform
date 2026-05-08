import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import type { AuthUser } from "@/types";

export const AUTH_COOKIE_NAME = "auth_token";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// =========================
// GET TOKEN
// =========================
export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("Authorization");

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookie = req.cookies.get(AUTH_COOKIE_NAME);
  if (cookie) return cookie.value;

  return null;
}

// =========================
// VERIFY USER
// =========================
export function getUserFromRequest(req: NextRequest): AuthUser | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email?: string;
    };

    return {
      userId: decoded.userId,
      email: decoded.email ?? "",
    };
  } catch (err) {
    console.error("[AuthMiddleware] Invalid token");
    return null;
  }
}