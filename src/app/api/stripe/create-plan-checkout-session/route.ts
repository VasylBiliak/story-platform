import { NextRequest } from "next/server";
import { createPlanCheckoutSessionHandler } from "@/server/controllers/stripeController";

export async function POST(req: NextRequest) {
  return createPlanCheckoutSessionHandler(req);
}
