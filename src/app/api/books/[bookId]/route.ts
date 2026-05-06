import { NextRequest } from "next/server";
import { getBookByIdHandler, updateBookHandler, deleteBookHandler } from "@/server/controllers/bookController";

export async function GET(req: NextRequest, context: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await context.params;
  return getBookByIdHandler(bookId);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await context.params;
  return updateBookHandler(req, bookId);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await context.params;
  return deleteBookHandler(req, bookId);
}
