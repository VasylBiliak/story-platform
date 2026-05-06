import { NextResponse } from "next/server";

export function successResponse(data: unknown) {
  return NextResponse.json({ success: true, data });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function unauthorizedResponse() {
  return errorResponse("Unauthorized", 401);
}

export function notFoundResponse(message = "Not found") {
  return errorResponse(message, 404);
}
