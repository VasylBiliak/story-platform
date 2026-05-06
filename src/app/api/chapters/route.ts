import { NextRequest } from "next/server";
import { getChaptersHandler } from "@/server/controllers/bookController";

export async function GET(req: NextRequest) {
  return getChaptersHandler(req);
}
