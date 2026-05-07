import { NextRequest } from "next/server";
import { getCurrentUser, type CurrentUser } from "@/lib/getCurrentUser";
import { unauthorizedResponse } from "@/server/utils/api";

export async function requireAuth(
  req: NextRequest
): Promise<CurrentUser> {
  const user = await getCurrentUser(req);
  if (!user) {
    throw unauthorizedResponse();
  }
  return user;
}
