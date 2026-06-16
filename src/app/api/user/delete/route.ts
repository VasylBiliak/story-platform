import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/server/prisma";
import { AUTH_COOKIE_NAME } from "@/server/middlewares/authMiddleware";

export async function DELETE(req: NextRequest) {
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

    console.log("[AccountDeletion] Starting deletion transaction for user:", user.id);

    // Use transaction to ensure all deletions succeed or rollback
    await prisma.$transaction(async (tx) => {
      // Delete books owned by user (this cascades to chapters, chapter images, and purchases for those books)
      const books = await tx.book.findMany({
        where: { ownerId: user.id },
        select: { id: true },
      });

      console.log("[AccountDeletion] Found", books.length, "books to delete");

      for (const book of books) {
        await tx.book.delete({
          where: { id: book.id },
        });
      }

      // Delete remaining purchases (those not tied to user's books)
      await tx.purchase.deleteMany({
        where: { userId: user.id },
      });

      // Delete remaining chapter purchases
      await tx.chapterPurchase.deleteMany({
        where: { userId: user.id },
      });

      // Delete the user
      await tx.user.delete({
        where: { id: user.id },
      });

      console.log("[AccountDeletion] Account deleted successfully");
    });

    // Create response with cleared cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Account deleted successfully",
      },
      { status: 200 }
    );

    // Clear auth cookie
    response.cookies.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("[AccountDeletion] Deletion error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
