import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/server/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // Verify email matches account
    if (email.toLowerCase() !== user.email.toLowerCase()) {
      console.log("[AccountDeletion] Verification failed: Email mismatch");
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_EMAIL",
          message: "The provided email does not match your account.",
        },
        { status: 400 }
      );
    }

    // Verify password
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, dbUser.password);

    if (!isPasswordValid) {
      console.log("[AccountDeletion] Verification failed: Invalid password");
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_PASSWORD",
          message: "Incorrect password.",
        },
        { status: 400 }
      );
    }

    console.log("[AccountDeletion] Verification successful for user:", user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Credentials verified",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AccountDeletion] Verification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
