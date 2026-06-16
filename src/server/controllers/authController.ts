import { NextResponse, type NextRequest } from "next/server";
import { loginSchema, registerSchema } from "@/server/utils/validation";
import { loginUser, registerUser } from "@/server/services/authService";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { AUTH_COOKIE_NAME } from "@/server/middlewares/authMiddleware";
import { AUTH_ERROR_CODES } from "@/lib/constants/auth";

const cookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7,
};

export async function registerHandler(req: NextRequest) {
  try {
    const body = await req.json();

    const parseResult = registerSchema.safeParse(body);
    if (!parseResult.success) {
      console.log("[AUTH] Registration validation failed:", parseResult.error.errors);
      return NextResponse.json(
        {
          success: false,
          message: parseResult.error.errors[0]?.message || "Invalid input",
        },
        { status: 400 }
      );
    }

    const { user, token } = await registerUser(
      parseResult.data.email,
      parseResult.data.password,
      parseResult.data.name
    );

    const response = NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, cookieOptions);

    return response;
  } catch (error) {
    console.error("[AUTH_ERROR] REGISTER:", error);

    if (error instanceof Error && (error as any).code) {
      const errorCode = (error as any).code;
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          code: errorCode,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function loginHandler(req: NextRequest) {
  try {
    const body = await req.json();

    const parseResult = loginSchema.safeParse(body);
    if (!parseResult.success) {
      console.log("[AUTH] Login validation failed:", parseResult.error.errors);
      return NextResponse.json(
        {
          success: false,
          message: parseResult.error.errors[0]?.message || "Invalid input",
        },
        { status: 400 }
      );
    }

    const { user, token } = await loginUser(
      parseResult.data.email,
      parseResult.data.password
    );

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, cookieOptions);

    return response;
  } catch (error) {
    console.error("[AUTH_ERROR] LOGIN:", error);

    if (error instanceof Error && (error as any).code === AUTH_ERROR_CODES.INVALID_CREDENTIALS) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          code: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function meHandler(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AUTH_ERROR] ME:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function logoutHandler() {
  const response = NextResponse.json(
    {
      success: true,
      message: "Logged out successfully",
    },
    { status: 200 }
  );

  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...cookieOptions,
    maxAge: 0,
  });

  return response;
}