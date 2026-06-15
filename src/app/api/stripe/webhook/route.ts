import { NextRequest } from "next/server";
import { webhookHandler } from "@/server/controllers/stripeController";

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  console.log("[Webhook] Route reached");
  console.log("[Webhook] Request received");
  
  return webhookHandler(req);
}
