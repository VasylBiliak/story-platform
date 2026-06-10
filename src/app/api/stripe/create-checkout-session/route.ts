import { NextRequest } from "next/server";
import { createCheckoutSessionHandler } from "@/server/controllers/stripeController";

export async function POST(req: NextRequest) {
  return createCheckoutSessionHandler(req);
}
