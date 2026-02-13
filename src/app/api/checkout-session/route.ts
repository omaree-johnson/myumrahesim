import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe-server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/checkout-session?session_id=xxx
 * Retrieves Stripe checkout session details
 */
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id parameter" },
        { status: 400 }
      );
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      id: session.id,
      payment_status: session.payment_status,
      customer_email: session.customer_email,
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
    });
  } catch (error) {
    console.error("[Checkout Session] Error retrieving session:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve session",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
