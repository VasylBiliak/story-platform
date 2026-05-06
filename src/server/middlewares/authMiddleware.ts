import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export type AuthUser = {
  userId: string;
  email: string;
};

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// =========================
// GET TOKEN
// =========================
export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("Authorization");

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookie = req.cookies.get("auth_token");
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