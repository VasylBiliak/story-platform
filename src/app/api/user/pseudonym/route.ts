import { NextRequest, NextResponse } from "next/server";
import { pseudonymUpdateSchema } from "@/server/utils/validation";
import { prisma } from "@/server/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { AUTH_ERROR_CODES, AUTH_ERROR_MESSAGES } from "@/lib/constants/auth";
import { sanitizePseudonym } from "@/lib/utils/sanitize";

export async function PUT(req: NextRequest) {
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

    const parseResult = pseudonymUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      console.log("[USER] Pseudonym update validation failed:", parseResult.error.errors);
      return NextResponse.json(
        {
          success: false,
          message: parseResult.error.errors[0]?.message || "Invalid input",
        },
        { status: 400 }
      );
    }

    const { pseudonym } = parseResult.data;
    const sanitizedPseudonym = sanitizePseudonym(pseudonym);

    // Check if pseudonym is empty after sanitization
    if (!sanitizedPseudonym) {
      return NextResponse.json(
        {
          success: false,
          message: "Pseudonym is required",
        },
        { status: 400 }
      );
    }

    // Check if another user already owns this pseudonym
    const existingUser = await prisma.user.findFirst({
      where: {
        name: sanitizedPseudonym,
        id: { not: user.id },
      },
    });

    if (existingUser) {
      console.log("[USER] Pseudonym update failed: Pseudonym already taken");
      return NextResponse.json(
        {
          success: false,
          message: AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.PSEUDONYM_ALREADY_EXISTS],
          code: AUTH_ERROR_CODES.PSEUDONYM_ALREADY_EXISTS,
        },
        { status: 400 }
      );
    }

    // Update the user's pseudonym
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: sanitizedPseudonym },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log("[USER] Pseudonym updated successfully for user:", user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Pseudonym updated successfully",
        pseudonym: updatedUser.name,
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[USER_ERROR] PSEUDONYM_UPDATE:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
