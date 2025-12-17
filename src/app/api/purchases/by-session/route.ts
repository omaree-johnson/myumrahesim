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
    // NOTE: A cart purchase can create multiple esim_purchases rows with the same payment intent.
    
    let purchase = null;
    let error = null;
    
    // First, try esim_purchases table (newer table used by webhook)
    if (hasPaymentIntent) {
      const { data, error: esimError } = await supabase
        .from('esim_purchases')
        .select('*')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .order('created_at', { ascending: false });
      
      if (!esimError && data && Array.isArray(data) && data.length > 0) {
        // For cart purchases, return the most recent as primary, plus all transaction IDs.
        purchase = {
          primary: data[0],
          all: data,
        };
      }
    }

    // Next, try esim_topups (top up flow)
    if (!purchase && hasPaymentIntent) {
      const { data: topup } = await supabase
        .from('esim_topups')
        .select('*')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .maybeSingle();

      if (topup) {
        purchase = { primary: topup, all: null, purchaseType: 'topup' };
      }
    }
    
    // (Zendit/legacy purchases table intentionally not used anymore)

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
    const primaryPurchase = (purchase as any).primary ? (purchase as any).primary : purchase;
    const allPurchases = (purchase as any).all ? (purchase as any).all : null;
    const purchaseType = (purchase as any).purchaseType || 'purchase';

    const transactionId = primaryPurchase.transaction_id;
    // Check provider status fields
    const status =
      primaryPurchase.esim_provider_status ||
      'pending';
    const offerId = primaryPurchase.offer_id || primaryPurchase.package_code || null;
    
    // Price handling - esim_purchases uses price/currency
    const priceAmount = primaryPurchase.price ? primaryPurchase.price / 100 : null;
    const priceCurrency = primaryPurchase.currency || 'USD';
    
    const productName =
      purchaseType === 'topup'
        ? `Top Up (${primaryPurchase.package_code || 'eSIM'})`
        : primaryPurchase.product_name ||
          primaryPurchase.esim_provider_response?.name ||
          primaryPurchase.esim_provider_response?.obj?.packageList?.[0]?.name ||
          primaryPurchase.confirmation?.shortNotes ||
          primaryPurchase.confirmation?.brandName ||
          'eSIM Plan';
    
    // Get confirmation from provider response
    const confirmation = primaryPurchase.esim_provider_response?.obj?.profileList?.[0] 
      || primaryPurchase.esim_provider_response?.obj?.esimList?.[0]
      || primaryPurchase.confirmation 
      || null;

    return NextResponse.json({
      transactionId,
      status,
      offerId,
      priceAmount,
      priceCurrency,
      productName: allPurchases ? `Cart (${allPurchases.length} items)` : productName,
      confirmation,
      purchaseType,
      ...(allPurchases
        ? { transactionIds: allPurchases.map((p: any) => p.transaction_id).filter(Boolean) }
        : {}),
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
