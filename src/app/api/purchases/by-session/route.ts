import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase, isSupabaseAdminReady } from "@/lib/supabase";

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

    if (!isSupabaseAdminReady()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    // Query database for purchase by stripe_session_id or stripe_payment_intent
    // Check both 'purchases' and 'esim_purchases' tables for compatibility
    
    let purchase = null;
    let error = null;
    
    // First, try esim_purchases table (newer table used by webhook)
    if (hasPaymentIntent) {
      const { data, error: esimError } = await supabase
        .from('esim_purchases')
        .select('*')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single();
      
      if (!esimError && data) {
        purchase = data;
      }
    }
    
    // If not found in esim_purchases, try purchases table (legacy)
    if (!purchase) {
      let query = supabase.from('purchases').select('*');
      
      if (hasSessionId) {
        query = query.eq('stripe_session_id', sessionId);
      } else if (hasPaymentIntent) {
        query = query.eq('stripe_payment_intent', paymentIntentId);
      }

      const { data, error: purchaseError } = await query.single();
      error = purchaseError;
      purchase = data;
    }

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

    // Handle both table structures
    const transactionId = purchase.transaction_id;
    // Check provider/zendit status fields
    const status = purchase.status || purchase.esim_provider_status || purchase.zendit_status || 'pending';
    const offerId = purchase.offer_id;
    
    // Price handling - esim_purchases uses price/currency, purchases uses price_amount/price_currency
    const priceAmount = purchase.price_amount || (purchase.price ? purchase.price / 100 : null);
    const priceCurrency = purchase.price_currency || purchase.currency || 'USD';
    
    // Product name from provider response or legacy Zendit response (for backward compatibility)
    const productName = purchase.esim_provider_response?.name
      || purchase.esim_provider_response?.obj?.packageList?.[0]?.name
      || purchase.zendit_response?.shortNotes 
      || purchase.zendit_response?.brandName 
      || purchase.confirmation?.shortNotes
      || purchase.confirmation?.brandName
      || 'eSIM Plan';
    
    // Get confirmation from provider response or legacy Zendit response
    const confirmation = purchase.esim_provider_response?.obj?.profileList?.[0] 
      || purchase.esim_provider_response?.obj?.esimList?.[0]
      || purchase.zendit_response?.confirmation 
      || purchase.confirmation 
      || null;

    return NextResponse.json({
      transactionId,
      status,
      offerId,
      priceAmount,
      priceCurrency,
      productName,
      confirmation,
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
