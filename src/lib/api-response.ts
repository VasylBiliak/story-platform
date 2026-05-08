import { NextResponse } from "next/server";

import type { ApiResponse } from "@/types";

export { ApiResponse };

export function successResponse<T>(
  message: string,
  data?: T,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function errorResponse(
  message: string,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

export function unauthorizedResponse(message: string = "Unauthorized"): NextResponse<ApiResponse> {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message: string = "Forbidden"): NextResponse<ApiResponse> {
  return errorResponse(message, 403);
}

export function notFoundResponse(message: string = "Not found"): NextResponse<ApiResponse> {
  return errorResponse(message, 404);
}

export function serverErrorResponse(message: string = "Internal server error"): NextResponse<ApiResponse> {
  return errorResponse(message, 500);
}
