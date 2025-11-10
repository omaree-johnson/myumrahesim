import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseReady } from "@/lib/supabase";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/purchases/by-session?session_id=xxx or payment_intent=xxx
 * Gets purchase details by Stripe session ID or payment intent ID
 */
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('session_id');
    const paymentIntentId = req.nextUrl.searchParams.get('payment_intent');

    // Filter out null/undefined values
    const hasSessionId = sessionId && sessionId !== 'null' && sessionId !== 'undefined';
    const hasPaymentIntent = paymentIntentId && paymentIntentId !== 'null' && paymentIntentId !== 'undefined';

    if (!hasSessionId && !hasPaymentIntent) {
      return NextResponse.json(
        { error: "Missing session_id or payment_intent parameter" },
        { status: 400 }
      );
    }

    if (!isSupabaseReady()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    // Query database for purchase by stripe_session_id or stripe_payment_intent
    let query = supabase.from('purchases').select('*');
    
    if (hasSessionId) {
      query = query.eq('stripe_session_id', sessionId);
    } else if (hasPaymentIntent) {
      query = query.eq('stripe_payment_intent', paymentIntentId);
    }

    const { data: purchase, error } = await query.single();

    if (error || !purchase) {
      // Purchase might not exist yet if webhook hasn't processed
      return NextResponse.json(
        { 
          status: 'pending',
          message: 'Payment successful, processing your order...'
        },
        { status: 202 } // 202 Accepted - processing
      );
    }

    return NextResponse.json({
      transactionId: purchase.transaction_id,
      status: purchase.status,
      offerId: purchase.offer_id,
      priceAmount: purchase.price_amount,
      priceCurrency: purchase.price_currency,
      productName: purchase.zendit_response?.shortNotes || purchase.zendit_response?.brandName || 'eSIM Plan',
      confirmation: purchase.zendit_response?.confirmation || null,
    });
  } catch (error) {
    console.error("[Purchase by Session] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve purchase",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
