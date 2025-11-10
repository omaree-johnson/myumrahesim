import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createEsimPurchase, getEsimProducts } from "@/lib/zendit";
import { supabase, isSupabaseReady } from "@/lib/supabase";
import { sendOrderConfirmation } from "@/lib/email";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/orders
 * Creates a new eSIM purchase with Zendit
 * 
 * Body: { offerId: string, recipientEmail: string, fullName: string }
 * Returns: { success: boolean, transactionId: string, purchase: object }
 */

export async function POST(req: NextRequest) {
  console.log('[Orders] POST /api/orders - Handler called');
  try {
    const { offerId, recipientEmail, fullName } = await req.json();
    console.log('[Orders] Received:', { offerId, recipientEmail, fullName });

    // Basic validation
    if (!offerId || !recipientEmail || !fullName) {
      return NextResponse.json(
        { error: "Missing required fields: offerId, recipientEmail, fullName" },
        { status: 400 }
      );
    }

    // Get user ID from Clerk if authenticated (wrapped in try-catch to handle auth issues)
    let userId = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch (authError) {
      console.log('[Orders] Auth not available, proceeding without user association');
    }
    let dbUserId = null;
    let dbPurchaseId = null;

    // If authenticated and Supabase is configured, sync with database
    if (isSupabaseReady() && userId) {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .upsert({
          email: recipientEmail,
          clerk_user_id: userId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'clerk_user_id'
        })
        .select()
        .single();

      if (!customerError && customer) {
        dbUserId = customer.id;
      }
    }

    // Generate unique transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Get product details for price
    console.log('[Orders] Fetching products from Zendit...');
    const products = await getEsimProducts();
    console.log('[Orders] Products response:', JSON.stringify(products).substring(0, 200));
    console.log('[Orders] Looking for offerId:', offerId);
    
    const product = products.find((p: any) => p.offerId === offerId);
    console.log('[Orders] Product found:', product ? 'YES' : 'NO');
    
    if (!product) {
      console.error('[Orders] Product not found. Available products:', products.map((p: any) => p.offerId).join(', '));
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const priceAmount = product.price.fixed / product.price.currencyDivisor;
    const priceCurrency = product.price.currency;

    // Save purchase to database first (as PENDING) if Supabase is configured
    if (isSupabaseReady()) {
      const { data: dbPurchase, error: dbError } = await supabase
        .from('purchases')
        .insert({
          transaction_id: transactionId,
          offer_id: offerId,
          customer_email: recipientEmail,
          customer_name: fullName,
          status: 'PENDING',
          price_amount: priceAmount,
          price_currency: priceCurrency,
          user_id: dbUserId,
          zendit_response: {}
        })
        .select()
        .single();

      if (dbError) {
        console.error("[Orders] Database error:", dbError);
        // Don't fail the order if database fails, just log it
      } else if (dbPurchase) {
        dbPurchaseId = dbPurchase.id;
      }
    }

    // Call Zendit API to purchase eSIM (server-side only)
    let purchase;
    try {
      purchase = await createEsimPurchase({ 
        offerId, 
        transactionId 
      });

      // Update database with Zendit response if Supabase is configured
      if (isSupabaseReady()) {
        await supabase
          .from('purchases')
          .update({
            status: purchase.status || 'PROCESSING',
            zendit_response: purchase,
            updated_at: new Date().toISOString()
          })
          .eq('transaction_id', transactionId);
      }

    } catch (zenditError) {
      console.error("[Orders] Zendit API error:", zenditError);
      
      // Update database with failed status if Supabase is configured
      if (isSupabaseReady()) {
        await supabase
          .from('purchases')
          .update({
            status: 'FAILED',
            zendit_response: { error: zenditError instanceof Error ? zenditError.message : 'Unknown error' },
            updated_at: new Date().toISOString()
          })
          .eq('transaction_id', transactionId);
      }

      return NextResponse.json(
        { error: "Failed to create purchase with provider" },
        { status: 500 }
      );
    }

    // Send order confirmation email (non-blocking)
    try {
      await sendOrderConfirmation({
        to: recipientEmail,
        customerName: fullName,
        transactionId,
        productName: product.name || `eSIM - ${product.data}`,
        price: `${priceCurrency} ${priceAmount.toFixed(2)}`
      });
      console.log('[Orders] Order confirmation email sent');
    } catch (emailError) {
      // Don't fail the order if email fails
      console.error('[Orders] Failed to send order confirmation email:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      transactionId,
      purchase,
      recipientEmail,
      dbPurchaseId: dbPurchaseId
    });
  } catch (error) {
    console.error("[Orders] Purchase creation error:", error);
    return NextResponse.json(
      { 
        error: "Failed to create purchase",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders
 * Gets all orders for the authenticated user (by email)
 */
export async function GET(req: NextRequest) {
  try {
    // Get user from Clerk
    const authResult = await auth();
    const userId = authResult.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!isSupabaseReady()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    // Get customer email
    const { data: customer } = await supabase
      .from('customers')
      .select('email, id')
      .eq('clerk_user_id', userId)
      .single();

    if (!customer) {
      return NextResponse.json({ orders: [] });
    }

    // Get all purchases by email OR user_id
    let query = supabase
      .from('purchases')
      .select(`
        *,
        activation_details (
          smdp_address,
          activation_code,
          iccid
        )
      `);

    // Search by both email and user_id
    if (customer.id) {
      query = query.or(`customer_email.eq.${customer.email},user_id.eq.${customer.id}`);
    } else {
      query = query.eq('customer_email', customer.email);
    }

    const { data: purchases, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error("[Orders] Error fetching orders:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    // Link any unlinked purchases
    const unlinkedPurchases = purchases?.filter((p: any) => !p.user_id) || [];
    if (unlinkedPurchases.length > 0) {
      await supabase
        .from('purchases')
        .update({ user_id: customer.id })
        .eq('customer_email', customer.email)
        .is('user_id', null);
    }

    return NextResponse.json({ orders: purchases || [] });
  } catch (error) {
    console.error("[Orders] Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to get orders",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
