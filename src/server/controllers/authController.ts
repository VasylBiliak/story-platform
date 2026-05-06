import { NextResponse, type NextRequest } from "next/server";
import { loginSchema, registerSchema } from "@/server/utils/validation";
import { successResponse, errorResponse, unauthorizedResponse } from "@/server/utils/api";
import { loginUser, registerUser } from "@/server/services/authService";
import { getUserFromRequest, AUTH_COOKIE_NAME } from "@/server/middlewares/authMiddleware";

const cookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7,
};

function buildAuthResponse(user: { id: string; email: string }, token: string) {
  const response = successResponse({ user });
  response.cookies.set(AUTH_COOKIE_NAME, token, cookieOptions);
  return response;
}

export async function registerHandler(req: NextRequest) {
  const body = await req.json();
  const parseResult = registerSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.errors[0]?.message ?? "Invalid input", 422);
  }

  try {
    const { user, token } = await registerUser(parseResult.data.email, parseResult.data.password);
    return buildAuthResponse({ id: user.id, email: user.email }, token);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to register", 400);
  }
}

export async function loginHandler(req: NextRequest) {
  const body = await req.json();
  const parseResult = loginSchema.safeParse(body);
  if (!parseResult.success) {
    return errorResponse(parseResult.error.errors[0]?.message ?? "Invalid input", 422);
  }

  try {
    const { user, token } = await loginUser(parseResult.data.email, parseResult.data.password);
    return buildAuthResponse({ id: user.id, email: user.email }, token);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Invalid credentials", 401);
  }
}

export async function meHandler(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return unauthorizedResponse();
  }

  return successResponse({ user });
}

export async function logoutHandler() {
  const response = successResponse({ message: "Logged out" });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...cookieOptions,
    maxAge: 0,
  });
  return response;
}
