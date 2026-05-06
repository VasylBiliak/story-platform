import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/server/prisma";
import { successResponse, errorResponse, unauthorizedResponse } from "@/server/utils/api";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

function getToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}