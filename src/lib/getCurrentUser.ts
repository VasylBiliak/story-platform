import { NextRequest } from "next/server";
import { prisma } from "@/server/prisma";
import { getTokenFromRequest } from "@/server/middlewares/authMiddleware";
import { verifyToken } from "@/lib/auth";
import type { CurrentUser } from "@/types";

export type { CurrentUser } from "@/types";

export async function getCurrentUser(
  req: NextRequest
): Promise<CurrentUser | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.$queryRaw<
    { id: string; email: string; name: string; plan: string }[]
  >`
    SELECT id, email, name, plan FROM "User" WHERE id = ${payload.userId} LIMIT 1
  `;

  if (!user || user.length === 0) {
    return null;
  }

  return user[0] as CurrentUser;
}
