import { NextResponse, type NextRequest } from "next/server";
import { loginSchema, registerSchema } from "@/server/utils/validation";
import { successResponse, errorResponse, unauthorizedResponse } from "@/server/utils/api";
import { loginUser, registerUser } from "@/server/services/authService";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { AUTH_COOKIE_NAME } from "@/server/middlewares/authMiddleware";

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
  try {
    const body = await req.json();

    const parseResult = registerSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse(
        parseResult.error.errors[0]?.message ?? "Invalid input",
        422
      );
    }

const { user, token } = await registerUser(
  parseResult.data.email,
  parseResult.data.password,
  parseResult.data.name
);

    const response = successResponse({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, cookieOptions);

    return response;
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return errorResponse("Failed to register", 500);
  }
}

export async function loginHandler(req: NextRequest) {
  try {
    const body = await req.json();

    const parseResult = loginSchema.safeParse(body);
    if (!parseResult.success) {
      return errorResponse(
        parseResult.error.errors[0]?.message ?? "Invalid input",
        422
      );
    }

    const { user, token } = await loginUser(
      parseResult.data.email,
      parseResult.data.password
    );

    const response = successResponse({
      id: user.id,
      email: user.email,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, cookieOptions);

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return errorResponse("Invalid credentials", 401);
  }
}

export async function meHandler(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return unauthorizedResponse();
    }

    return successResponse({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("ME ERROR:", error);

    return unauthorizedResponse();
  }
}

export async function logoutHandler() {
  const response = successResponse({ message: "Logged out" });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...cookieOptions,
    maxAge: 0,
  });
  return response;
}
