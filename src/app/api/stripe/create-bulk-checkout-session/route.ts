import { NextRequest } from "next/server";
import { createBulkCheckoutSessionHandler } from "@/server/controllers/stripeController";

export async function POST(req: NextRequest) {
  return createBulkCheckoutSessionHandler(req);
}
