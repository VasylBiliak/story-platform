import { NextRequest } from "next/server";
import { prisma } from "@/server/prisma";
import { getTokenFromRequest } from "@/server/middlewares/authMiddleware";
import { verifyToken } from "@/lib/auth";

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
};

export async function getCurrentUser(
  req: NextRequest
): Promise<CurrentUser | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  return user;
}
