import { NextRequest } from "next/server";
import { webhookHandler } from "@/server/controllers/stripeController";

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  return webhookHandler(req);
}
