import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/server/prisma";
import { successResponse, errorResponse, unauthorizedResponse } from "@/server/utils/api";
import bcrypt from "bcryptjs";

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

export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token) {
    return unauthorizedResponse();
  }

  const payload = verifyToken(token);
  if (!payload) {
    return unauthorizedResponse();
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  if (!user) {
    return unauthorizedResponse();
  }

  return successResponse(user);
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return unauthorizedResponse();
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
  return successResponse({ token });
}