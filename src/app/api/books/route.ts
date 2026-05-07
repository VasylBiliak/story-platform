import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { BookService } from "@/lib/services/book.service";
import { bookCreateSchema } from "@/lib/validators/book";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function GET() {
  try {
    const books = await BookService.getBooks();
    return successResponse("Books retrieved successfully", books);
  } catch (error) {
    console.error("[API] GET books error:", error);
    return serverErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await req.json();

    const parseResult = bookCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse(
        parseResult.error.errors[0]?.message ?? "Invalid input",
        400
      );
    }

    const book = await BookService.createBook(
      parseResult.data,
      user.id,
      user.name || user.email
    );

    return successResponse("Book created successfully", book, 201);
  } catch (error) {
    console.error("[API] POST books error:", error);
    return serverErrorResponse();
  }
}
