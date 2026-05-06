import { NextRequest } from "next/server";
import { listBooksHandler, createBookHandler } from "@/server/controllers/bookController";

export async function GET() {
  return listBooksHandler();
}

export async function POST(req: NextRequest) {
  return createBookHandler(req);
}
