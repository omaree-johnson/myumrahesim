import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin as supabase, isSupabaseAdminReady } from "@/lib/supabase";
import {
  checkRateLimit,
  getClientIP,
  isValidEmail,
  isValidFullName,
  isValidOfferId,
  sanitizeString,
} from "@/lib/security";
import {
  normalizeDiscountCode,
  reserveDiscountForPaymentIntent,
} from "@/lib/discounts";
import { calculateCartPricing } from "@/lib/pricing-calculator";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CartItemInput = { offerId: string; quantity: number };

function encodeCartItems(items: CartItemInput[]) {
  // Compact encoding for Stripe metadata (500 char limit per value)
  // Example: "CKH036:2,CKH277:1"
  return items
    .map((i) => `${i.offerId}:${i.quantity}`)
    .join(",");
}

/**
 * POST /api/create-cart-payment-intent
 * Body: { items: [{offerId, quantity}], recipientEmail?: string, fullName?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(`cart-payment-intent:${clientIP}`, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const rawItems: unknown = body?.items;
    const recipientEmail = body?.recipientEmail;
    const fullName = body?.fullName;
    const discountCode = body?.discountCode;
    const cartToken = body?.cartToken;
    const finalPriceCents = body?.finalPriceCents; // Optional: server-calculated price

    const sanitizedEmail = recipientEmail
      ? sanitizeString(String(recipientEmail).toLowerCase().trim(), 254)
      : undefined;
    const sanitizedFullName = fullName
      ? sanitizeString(String(fullName).trim(), 200)
      : undefined;
    const sanitizedDiscountCode = normalizeDiscountCode(discountCode);
    const sanitizedCartToken = cartToken ? sanitizeString(String(cartToken).trim(), 128) : undefined;

    if (sanitizedEmail && !isValidEmail(sanitizedEmail)) {
      return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
    }
    if (sanitizedFullName && !isValidFullName(sanitizedFullName)) {
      return NextResponse.json({ error: "Invalid name format" }, { status: 400 });
    }

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (rawItems.length > 10) {
      return NextResponse.json({ error: "Too many items in cart" }, { status: 400 });
    }

    const items: CartItemInput[] = rawItems.map((i: any) => ({
      offerId: sanitizeString(String(i?.offerId || ""), 100),
      quantity: Math.max(1, Math.min(10, Number(i?.quantity) || 1)),
    }));

    for (const i of items) {
      if (!i.offerId || !isValidOfferId(i.offerId)) {
        return NextResponse.json({ error: "Invalid offer ID in cart" }, { status: 400 });
      }
    }

    // Get server-calculated pricing (prevents client-side price manipulation)
    const pricing = await calculateCartPricing(items, sanitizedDiscountCode);
    
    if (!pricing.success) {
      return NextResponse.json(
        { error: pricing.error },
        { status: 400 }
      );
    }

    // CRITICAL: Verify provided price matches server-calculated price
    // This prevents client-side price tampering
    const providedFinalPriceCents = typeof finalPriceCents === 'number' 
      ? Math.round(finalPriceCents) 
      : null;
    
    if (providedFinalPriceCents !== null && providedFinalPriceCents !== pricing.finalPriceCents) {
      return NextResponse.json(
        { 
          error: "Price mismatch. Please refresh and try again.",
          expectedPrice: pricing.finalPriceCents,
          providedPrice: providedFinalPriceCents
        },
        { status: 400 }
      );
    }

    const currency = pricing.currency.toUpperCase();
    const finalPriceCentsValue = pricing.finalPriceCents;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    // Build descriptive product name and description from cart items
    // Note: We don't have product names here, so we'll use offerIds
    const productNames = items.map(item => {
      const qty = item.quantity > 1 ? ` (×${item.quantity})` : '';
      return `${item.offerId}${qty}`;
    });
    const productDescription = productNames.join(', ');
    const truncatedDescription = productDescription.length > 180 
      ? productDescription.substring(0, 177) + '...' 
      : productDescription;
    const cartProductName = productNames.length > 3 
      ? `Cart: ${productNames.slice(0, 2).join(', ')}, +${productNames.length - 2} more`
      : `Cart: ${productNames.join(', ')}`;
    const cartProductNameTruncated = cartProductName.length > 190
      ? cartProductName.substring(0, 187) + '...'
      : cartProductName;

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const cartItemsEncoded = encodeCartItems(items).slice(0, 500);

    // Generate idempotency key with price hash for uniqueness
    const priceHash = Math.floor(pricing.finalPriceCents / 100).toString(36).slice(-6);
    const promoCodeForIdempotency = pricing.promoCode || sanitizedDiscountCode || 'nodisc';
    const idempotencyKey = `cart_${transactionId}_${promoCodeForIdempotency}_${priceHash}_${Math.floor(Date.now() / 60000)}`;

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: finalPriceCentsValue,
        currency: currency.toLowerCase(),
        ...(sanitizedEmail && { receipt_email: sanitizedEmail }),
        metadata: {
          transactionId,
          cartItems: cartItemsEncoded,
          ...(sanitizedCartToken && { cartToken: sanitizedCartToken }),
          ...(sanitizedEmail && { recipientEmail: sanitizedEmail }),
          ...(sanitizedFullName && { fullName: sanitizedFullName }),
          // Store pricing details for verification
          original_price: String(pricing.originalPriceCents),
          discount_applied: String(pricing.discountAmountCents),
          discount_percent: String(pricing.discountPercent),
          final_price: String(pricing.finalPriceCents),
          currency: currency,
          ...(pricing.appliedPromotion && {
            promotion_id: pricing.appliedPromotion.id,
            promotion_name: pricing.appliedPromotion.name,
            ...(pricing.promoCode && { promo_code: pricing.promoCode }),
          }),
          productName: cartProductNameTruncated,
        },
        description: truncatedDescription || `Cart purchase (${totalQuantity} eSIM${totalQuantity !== 1 ? "s" : ""})`,
        // Enable automatic payment methods (includes SCA for EU customers)
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'always', // Required for SCA in EU
        },
        // Enable 3D Secure for EU customers (SCA compliance)
        payment_method_options: {
          card: {
            request_three_d_secure: 'automatic', // Automatically request 3DS when required
          },
        },
        // Capture method: automatic (immediate) or manual (delayed)
        capture_method: 'automatic',
      },
      {
        idempotencyKey: idempotencyKey.substring(0, 255),
      },
    );

    // Reserve discount code for this payment intent (prevents double-spend)
    if (pricing.appliedPromotion && pricing.promoCode) {
      const reservation = await reserveDiscountForPaymentIntent({
        codeRaw: pricing.promoCode,
        paymentIntentId: paymentIntent.id,
        customerEmail: sanitizedEmail || null,
        transactionId,
        appliesTo: "cart",
      });
      if (!reservation.ok) {
        try {
          await stripe.paymentIntents.cancel(paymentIntent.id);
        } catch {}
        return NextResponse.json({ error: reservation.error }, { status: 409 });
      }
    }

    // Best-effort: mark cart checkout started
    if (sanitizedCartToken && isSupabaseAdminReady()) {
      try {
        await supabase
          .from("cart_sessions")
          .update({
            checkout_started_at: new Date().toISOString(),
            stripe_payment_intent_id: paymentIntent.id,
            updated_at: new Date().toISOString(),
          })
          .eq("token", sanitizedCartToken);
      } catch {
        // Ignore
      }
    }

    return NextResponse.json(
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        summary: {
          currency,
          originalPrice: (pricing.originalPriceCents / 100).toFixed(2),
          discountPercent: pricing.discountPercent,
          discountAmount: (pricing.discountAmountCents / 100).toFixed(2),
          finalPrice: (pricing.finalPriceCents / 100).toFixed(2),
          totalQuantity,
          ...(pricing.appliedPromotion && {
            promotionId: pricing.appliedPromotion.id,
            promotionName: pricing.appliedPromotion.name,
            promoCode: pricing.promoCode,
          }),
          ...(pricing.volumeDiscount && {
            volumeDiscount: {
              percent: pricing.volumeDiscount.percent,
              threshold: (pricing.volumeDiscount.thresholdCents / 100).toFixed(2),
            },
          }),
          items: items.map((item) => ({
            offerId: item.offerId,
            quantity: item.quantity,
          })),
        },
      },
      {
        headers: {
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": rateLimit.resetAt.toString(),
        },
      },
    );
  } catch (error) {
    console.error("[Stripe] Error creating cart payment intent:", error);
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}

