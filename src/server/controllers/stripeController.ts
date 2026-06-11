import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/server/prisma";
import { checkChapterOwnershipRepository, createChapterPurchaseRepository } from "@/server/modules/chapters/chapter.repository";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

export async function createCheckoutSessionHandler(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { chapterId } = body;

    if (!chapterId) {
      return NextResponse.json(
        { success: false, message: "Chapter ID is required" },
        { status: 400 }
      );
    }

    // Verify chapter exists and include book for ID
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        book: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json(
        { success: false, message: "Chapter not found" },
        { status: 404 }
      );
    }

    // Verify chapter is paid
    if (chapter.price === 0) {
      return NextResponse.json(
        { success: false, message: "Chapter is free" },
        { status: 400 }
      );
    }

    // Verify user does not already own chapter
    const alreadyOwned = await checkChapterOwnershipRepository(chapterId, user.id);
    if (alreadyOwned) {
      return NextResponse.json(
        { success: false, message: "Chapter already purchased" },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    console.log("[CHECKOUT] Creating session with metadata:", {
      userId: user.id,
      chapterId: chapter.id,
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: chapter.title,
              metadata: {
                chapterId: chapter.id,
              },
            },
            unit_amount: Math.round(chapter.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/book/${chapter.bookId}/chapter/${chapter.slug}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/book/${chapter.bookId}/chapter/${chapter.slug}?payment=cancelled`,
      metadata: {
        userId: user.id,
        chapterId: chapter.id,
      },
    });
    console.log("[CHECKOUT] Session created successfully:", {
      sessionId: session.id,
      metadata: session.metadata,
    });

    return NextResponse.json(
      {
        success: true,
        checkoutUrl: session.url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[STRIPE_ERROR] CREATE_CHECKOUT_SESSION:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function webhookHandler(req: NextRequest) {
  console.log("[WEBHOOK] ===== Webhook received =====");
  console.log("[WEBHOOK] Timestamp:", new Date().toISOString());
  console.log("[WEBHOOK] Method:", req.method);
  console.log("[WEBHOOK] URL:", req.url);
  console.log("[WEBHOOK] Headers:", Object.fromEntries(req.headers.entries()));
  
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") as string;

    console.log("[WEBHOOK] Signature present:", !!signature);
    console.log("[WEBHOOK] Body length:", body.length);
    console.log("[WEBHOOK] Body preview:", body.substring(0, 200));

    if (!signature) {
      console.error("[WEBHOOK] ERROR: Missing Stripe signature");
      return NextResponse.json(
        { success: false, message: "Missing Stripe signature" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[WEBHOOK] ERROR: Webhook secret not configured");
      return NextResponse.json(
        { success: false, message: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    console.log("[WEBHOOK] Webhook secret configured:", webhookSecret.substring(0, 10) + "...");

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log("[WEBHOOK] Signature verified successfully");
      console.log("[WEBHOOK] Event type:", event.type);
      console.log("[WEBHOOK] Event ID:", event.id);
    } catch (err) {
      console.error("[WEBHOOK] ERROR: Signature verification failed");
      console.error("[WEBHOOK] Error message:", err instanceof Error ? err.message : String(err));
      console.error("[WEBHOOK] Error stack:", err instanceof Error ? err.stack : 'No stack');
      console.error("[WEBHOOK] Webhook secret used:", webhookSecret.substring(0, 10) + "...");
      console.error("[WEBHOOK] Signature:", signature.substring(0, 20) + "...");
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      console.log("[WEBHOOK] ===== Processing checkout.session.completed =====");
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("[WEBHOOK] Session ID:", session.id);
      console.log("[WEBHOOK] Session metadata:", JSON.stringify(session.metadata, null, 2));
      console.log("[WEBHOOK] Session payment status:", session.payment_status);
      
      const { userId, chapterId } = session.metadata as {
        userId: string;
        chapterId: string;
      };

      console.log("[WEBHOOK] Extracted metadata:", { userId, chapterId });

      if (!userId || !chapterId) {
        console.error("[WEBHOOK] ERROR: Missing required metadata");
        console.error("[WEBHOOK] Available metadata:", session.metadata);
        return NextResponse.json(
          { success: false, message: "Missing metadata" },
          { status: 400 }
        );
      }

      // Verify chapter exists
      console.log("[WEBHOOK] Verifying chapter exists:", chapterId);
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
      });

      if (!chapter) {
        console.error("[WEBHOOK] ERROR: Chapter not found:", chapterId);
        return NextResponse.json(
          { success: false, message: "Chapter not found" },
          { status: 404 }
        );
      }

      console.log("[WEBHOOK] Chapter verified:", chapter.title);
      console.log("[WEBHOOK] Chapter price:", chapter.price);

      // Create ChapterPurchase record (idempotent via upsert)
      console.log("[WEBHOOK] ===== Creating ChapterPurchase record =====");
      console.log("[WEBHOOK] userId:", userId);
      console.log("[WEBHOOK] chapterId:", chapterId);
      await createChapterPurchaseRepository(userId, chapterId);
      console.log("[WEBHOOK] ChapterPurchase record created successfully");
    } else {
      console.log("[WEBHOOK] Unhandled event type:", event.type);
    }

    console.log("[WEBHOOK] ===== Webhook processed successfully =====");
    return NextResponse.json(
      { success: true, message: "Webhook processed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[WEBHOOK] ERROR: Unhandled exception");
    console.error("[WEBHOOK] Error:", error);
    console.error("[WEBHOOK] Error message:", error instanceof Error ? error.message : String(error));
    console.error("[WEBHOOK] Error stack:", error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
