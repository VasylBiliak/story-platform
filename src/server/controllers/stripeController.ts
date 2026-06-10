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

    // Verify chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
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
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/books/${chapter.bookId}/chapters/${chapter.slug}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/books/${chapter.bookId}/chapters/${chapter.slug}?payment=cancelled`,
      metadata: {
        userId: user.id,
        chapterId: chapter.id,
      },
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
  console.log("[STRIPE_WEBHOOK] Webhook received");
  
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") as string;

    console.log("[STRIPE_WEBHOOK] Signature present:", !!signature);

    if (!signature) {
      return NextResponse.json(
        { success: false, message: "Missing Stripe signature" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[STRIPE_WEBHOOK] Webhook secret not configured");
      return NextResponse.json(
        { success: false, message: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log("[STRIPE_WEBHOOK] Signature verified, event type:", event.type);
    } catch (err) {
      console.error("[STRIPE_ERROR] WEBHOOK_SIGNATURE_VERIFICATION:", err);
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      console.log("[STRIPE_WEBHOOK] Processing checkout.session.completed");
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, chapterId } = session.metadata as {
        userId: string;
        chapterId: string;
      };

      console.log("[STRIPE_WEBHOOK] Metadata extracted:", { userId, chapterId });

      if (!userId || !chapterId) {
        console.error("[STRIPE_ERROR] WEBHOOK_MISSING_METADATA:", session.metadata);
        return NextResponse.json(
          { success: false, message: "Missing metadata" },
          { status: 400 }
        );
      }

      // Verify chapter exists
      console.log("[STRIPE_WEBHOOK] Verifying chapter exists:", chapterId);
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
      });

      if (!chapter) {
        console.error("[STRIPE_ERROR] WEBHOOK_CHAPTER_NOT_FOUND:", chapterId);
        return NextResponse.json(
          { success: false, message: "Chapter not found" },
          { status: 404 }
        );
      }

      console.log("[STRIPE_WEBHOOK] Chapter verified:", chapter.title);

      // Check if ownership already exists (idempotency)
      console.log("[STRIPE_WEBHOOK] Checking existing ownership");
      const alreadyOwned = await checkChapterOwnershipRepository(chapterId, userId);
      if (alreadyOwned) {
        console.log("[STRIPE_WEBHOOK] Chapter already owned, skipping");
        return NextResponse.json(
          { success: true, message: "Already owned" },
          { status: 200 }
        );
      }

      // Create ChapterPurchase record
      console.log("[STRIPE_WEBHOOK] Creating chapter purchase record");
      await createChapterPurchaseRepository(userId, chapterId);
      console.log("[STRIPE_WEBHOOK] Chapter purchase created successfully:", { userId, chapterId });
    }

    console.log("[STRIPE_WEBHOOK] Webhook processed successfully");
    return NextResponse.json(
      { success: true, message: "Webhook processed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[STRIPE_ERROR] WEBHOOK:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
