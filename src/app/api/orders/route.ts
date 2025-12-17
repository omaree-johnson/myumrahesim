import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createEsimOrder } from "@/lib/esimaccess";
import { getCachedEsimProducts } from "@/lib/products-cache";
import { supabaseAdmin as supabase, isSupabaseAdminReady } from "@/lib/supabase";
import { sendOrderConfirmation } from "@/lib/email";
import { 
  isValidEmail, 
  isValidOfferId, 
  isValidFullName, 
  sanitizeString,
  checkRateLimit,
  getClientIP,
  validateBodySize
} from "@/lib/security";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/orders
 * Creates a direct eSIM purchase through the provider API (eSIM Access)
 * 
 * Body: { offerId: string, recipientEmail: string, fullName: string }
 * Returns: { success: boolean, transactionId: string, purchase: object, orderId: string }
 */

export async function POST(req: NextRequest) {
  console.log('[Orders] POST /api/orders - Handler called');
  try {
    // Request body size validation
    const contentLength = req.headers.get('content-length');
    const bodySizeCheck = validateBodySize(contentLength, 1024 * 1024); // 1MB max
    if (!bodySizeCheck.valid) {
      return NextResponse.json(
        { error: bodySizeCheck.error || "Request body too large" },
        { status: 413 }
      );
    }

    // Rate limiting
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(`orders:${clientIP}`, 10, 60000); // 10 requests per minute
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toString()
          }
        }
      );
    }

    const { offerId, recipientEmail, fullName } = await req.json();
    
    // Input validation
    if (!offerId || !recipientEmail || !fullName) {
      return NextResponse.json(
        { error: "Missing required fields: offerId, recipientEmail, fullName" },
        { status: 400 }
      );
    }

    // Sanitize and validate inputs
    const sanitizedOfferId = sanitizeString(offerId, 100);
    const sanitizedEmail = sanitizeString(recipientEmail.toLowerCase().trim(), 254);
    const sanitizedFullName = sanitizeString(fullName, 200);

    if (!isValidOfferId(sanitizedOfferId)) {
      return NextResponse.json(
        { error: "Invalid offer ID format" },
        { status: 400 }
      );
    }

    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }

    if (!isValidFullName(sanitizedFullName)) {
      return NextResponse.json(
        { error: "Invalid name format" },
        { status: 400 }
      );
    }

    console.log('[Orders] Received:', { offerId: sanitizedOfferId, recipientEmail: sanitizedEmail, fullName: sanitizedFullName });

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
    if (isSupabaseAdminReady() && userId) {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .upsert({
          email: sanitizedEmail,
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
    console.log('[Orders] Fetching products from provider...');
    // Only Saudi Arabia eSIMs
    const products = await getCachedEsimProducts("SA");
    console.log('[Orders] Products response:', JSON.stringify(products).substring(0, 200));
    console.log('[Orders] Looking for offerId:', sanitizedOfferId);
    
    // Provider uses package ID (slug/packageCode) as offerId
    const product = products.find((p: any) => 
      p.offerId === sanitizedOfferId || 
      p.packageCode === sanitizedOfferId || 
      p.slug === sanitizedOfferId
    );
    console.log('[Orders] Product found:', product ? 'YES' : 'NO');
    
    if (!product) {
      console.error('[Orders] Product not found. Available products:', products.map((p: any) => p.offerId || p.packageCode).join(', '));
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const priceAmount = product.price.fixed / (product.price.currencyDivisor || 100);
    const priceCurrency = product.price.currency;
    const packageCode = product.packageCode || product.slug || sanitizedOfferId;
    
    // Calculate provider cost in cents for eSIM Access API
    // Use costPrice if available (original provider cost), otherwise use selling price
    const costPriceData = product.costPrice || product.price;
    const costDivisor = costPriceData.currencyDivisor || 100;
    const providerCostInCents = Math.round((costPriceData.fixed / costDivisor) * 100);

    // Save purchase to database first (as PENDING) if Supabase is configured
    if (isSupabaseAdminReady()) {
      const { data: dbPurchase, error: dbError } = await supabase
        .from('esim_purchases')
        .insert({
          transaction_id: transactionId,
          offer_id: sanitizedOfferId,
          customer_email: sanitizedEmail,
          customer_name: sanitizedFullName,
          user_id: dbUserId || 'anonymous',
          price: Math.round(priceAmount * 100),
          currency: String(priceCurrency || 'USD').toUpperCase(),
          esim_provider_cost: providerCostInCents,
          esim_provider_status: 'PENDING',
          package_code: packageCode,
          product_name: product.shortNotes || product.brandName || 'eSIM Plan',
          esim_provider_response: {},
          order_no: null, // Will be set after order creation
          esim_tran_no: null,
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

    // Call provider API to purchase eSIM (server-side only)
    let purchase;
    try {
      purchase = await createEsimOrder({ 
        packageCode: packageCode, 
        transactionId,
        amountInCents: providerCostInCents, // Pass provider cost in cents for price validation
        travelerEmail: sanitizedEmail,
        travelerName: sanitizedFullName,
      });

      // Update database with provider response if Supabase is configured
      if (isSupabaseAdminReady()) {
        await supabase
          .from('esim_purchases')
          .update({
            esim_provider_status: purchase.orderNo ? 'GOT_RESOURCE' : 'PROCESSING',
            esim_provider_response: purchase.raw || purchase,
            order_no: purchase.orderNo || purchase.orderId || null,
            esim_tran_no: purchase.esimTranNo || null,
            confirmation: null, // Will be fetched via queryEsimProfiles
            updated_at: new Date().toISOString()
          })
          .eq('transaction_id', transactionId);
      }

    } catch (providerError) {
      console.error("[Orders] eSIM provider API error:", providerError);
      
      // Update database with failed status if Supabase is configured
      if (isSupabaseAdminReady()) {
        await supabase
          .from('esim_purchases')
          .update({
            esim_provider_status: 'FAILED',
            esim_provider_response: { error: providerError instanceof Error ? providerError.message : 'Unknown error' },
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
        to: sanitizedEmail,
        customerName: sanitizedFullName,
        transactionId,
        productName: sanitizeString(product.name || `eSIM - ${product.data}`, 200),
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
      orderId: purchase.orderNo || purchase.orderId || null,
      purchase: {
        orderId: purchase.orderNo || purchase.orderId,
        orderNo: purchase.orderNo,
        esimTranNo: purchase.esimTranNo,
        iccid: purchase.iccid,
      },
      recipientEmail: sanitizedEmail,
      dbPurchaseId: dbPurchaseId
    }, {
      headers: {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetAt.toString()
      }
    });
  } catch (error) {
    console.error("[Orders] Purchase creation error:", error);
    // Don't expose internal error details to client
    return NextResponse.json(
      { 
        error: "Failed to create purchase. Please try again later."
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

    if (!isSupabaseAdminReady()) {
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
    // Use parameterized queries to prevent SQL injection
    let query = supabase
      .from('esim_purchases')
      .select(`
        *,
        activation_details (
          smdp_address,
          activation_code,
          iccid
        )
      `);

    // Search by both email and user_id using safe parameterized queries
    if (customer.id) {
      // Use .or() with proper parameterization - Supabase handles this safely
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
        .from('esim_purchases')
        .update({ user_id: customer.id })
        .eq('customer_email', customer.email)
        .is('user_id', null);
    }

    return NextResponse.json({ orders: purchases || [] });
  } catch (error) {
    console.error("[Orders] Error:", error);
    // Don't expose internal error details to client
    return NextResponse.json(
      { 
        error: "Failed to get orders. Please try again later."
      },
      { status: 500 }
    );
  }
}
