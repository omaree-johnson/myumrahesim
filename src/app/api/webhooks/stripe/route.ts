import { NextRequest, NextResponse } from "next/server";
import { verifyStripeSignature } from "@/lib/webhooks/stripe/verify-signature";
import { logStripeWebhookEvent } from "@/lib/webhooks/stripe/services/persistence";
import { routeStripeWebhookEvent } from "@/lib/webhooks/stripe/router";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events (payment success, etc.)
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  try {
    const event = verifyStripeSignature(body, signature);
    await logStripeWebhookEvent(event);
    return await routeStripeWebhookEvent(event);
  } catch (error) {
    if (error instanceof Error && error.message === "NO_SIGNATURE") {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "INVALID_SIGNATURE") {
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
    }
    console.error("[Stripe Webhook] Unhandled webhook error:", error);
    return NextResponse.json(
      { error: "Internal webhook error" },
      { status: 500 }
    );
  }
}
