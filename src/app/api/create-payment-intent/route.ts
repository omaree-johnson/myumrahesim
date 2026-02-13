import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe-server";
import { getCachedEsimProducts } from "@/lib/products-cache";
import { 
  isValidEmail, 
  isValidOfferId, 
  isValidFullName, 
  sanitizeString,
  checkRateLimit,
  getClientIP
} from "@/lib/security";
import {
  normalizeDiscountCode,
  reserveDiscountForPaymentIntent,
} from "@/lib/discounts";
import { calculatePricing } from "@/lib/pricing-calculator";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/create-payment-intent
 * Creates a Stripe Payment Intent for embedded checkout
 * 
 * Body: { offerId: string, recipientEmail?: string, fullName?: string }
 * Returns: { clientSecret: string, productDetails: object }
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(`payment-intent:${clientIP}`, 10, 60000); // 10 requests per minute
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

    const { offerId, recipientEmail, fullName, discountCode, finalPriceCents: providedFinalPriceCentsFromClient } = await req.json();
    
    if (!offerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Sanitize and validate inputs
    const sanitizedOfferId = sanitizeString(offerId, 100);
    const sanitizedEmail = recipientEmail
      ? sanitizeString(recipientEmail.toLowerCase().trim(), 254)
      : undefined;
    const sanitizedFullName = fullName ? sanitizeString(fullName, 200) : undefined;
    const sanitizedDiscountCode = normalizeDiscountCode(discountCode);
    
    // Validate finalPriceCents if provided (optional for backward compatibility)
    const providedFinalPriceCents = typeof providedFinalPriceCentsFromClient === 'number' 
      ? Math.round(providedFinalPriceCentsFromClient) 
      : null;

    if (!isValidOfferId(sanitizedOfferId)) {
      return NextResponse.json(
        { error: "Invalid offer ID format" },
        { status: 400 }
      );
    }

    if (sanitizedEmail && !isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }

    if (sanitizedFullName && !isValidFullName(sanitizedFullName)) {
      return NextResponse.json(
        { error: "Invalid name format" },
        { status: 400 }
      );
    }

    console.log('[Stripe] Creating payment intent for:', { 
      offerId: sanitizedOfferId, 
      recipientEmail: sanitizedEmail, 
      fullName: sanitizedFullName 
    });

    // Get server-calculated pricing (prevents client-side price manipulation)
    const pricing = await calculatePricing(sanitizedOfferId, sanitizedDiscountCode);
    
    if (!pricing.success) {
      return NextResponse.json(
        { error: pricing.error },
        { status: 400 }
      );
    }

    // CRITICAL: Verify provided price matches server-calculated price
    // This prevents client-side price tampering
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

    // Get product details for metadata
    const products = await getCachedEsimProducts("SA");
    const product = products.find((p: any) => 
      p.offerId === sanitizedOfferId || 
      p.packageCode === sanitizedOfferId || 
      p.slug === sanitizedOfferId
    );

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Product display name and description
    const productName = product.shortNotes || product.brandName || 'eSIM Plan';
    const formattedDataGB = product.dataGB 
      ? (product.dataGB < 1 ? product.dataGB.toFixed(1) : Math.round(product.dataGB))
      : '0';
    const productDescription = `${product.dataUnlimited ? 'Unlimited' : `${formattedDataGB}GB`} data • ${product.durationDays} days • ${product.country || 'Regional'}`;

    // Use server-calculated pricing
    const finalPriceCents = pricing.finalPriceCents;
    const currency = pricing.currency.toLowerCase();

    // Create Payment Intent with server-calculated price
    // Store comprehensive metadata for audit and verification
    const metadata: Record<string, string> = {
      offerId: sanitizedOfferId,
      productName: sanitizeString(productName, 200),
      // Store pricing details for verification
      original_price: String(pricing.originalPriceCents),
      discount_applied: String(pricing.discountAmountCents),
      discount_percent: String(pricing.discountPercent),
      final_price: String(pricing.finalPriceCents),
      currency: currency,
    };

    if (sanitizedEmail) metadata.recipientEmail = sanitizedEmail;
    if (sanitizedFullName) metadata.fullName = sanitizedFullName;
    
    // Store promotion details if applied
    if (pricing.appliedPromotion) {
      metadata.promotion_id = pricing.appliedPromotion.id;
      metadata.promotion_name = pricing.appliedPromotion.name;
      if (pricing.promoCode) {
        metadata.promo_code = pricing.promoCode;
      }
    }

    // Generate idempotency key to prevent duplicate payment intents
    // Include offerId, email, promo code, and price hash for uniqueness
    const priceHash = Math.floor(pricing.finalPriceCents / 100).toString(36).slice(-6);
    const promoCodeForIdempotency = pricing.promoCode || sanitizedDiscountCode || 'nodisc';
    const idempotencyKey = `pi_${sanitizedOfferId}_${sanitizedEmail || 'noemail'}_${promoCodeForIdempotency}_${priceHash}_${Math.floor(Date.now() / 60000)}`;

    // Create Payment Intent with Stripe best practices for EU customers
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: finalPriceCents,
      currency: currency,
      ...(sanitizedEmail && { receipt_email: sanitizedEmail }),
      metadata,
      description: `${sanitizeString(productName, 200)} - ${sanitizeString(productDescription, 500)}`,
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
    }, {
      idempotencyKey: idempotencyKey.substring(0, 255), // Stripe limits idempotency keys to 255 chars
    });

    // Reserve discount code for this payment intent (prevents double-spend)
    // Note: Virtual promo codes (Ramadan) skip database reservation
    if (pricing.appliedPromotion && pricing.promoCode) {
      const reservation = await reserveDiscountForPaymentIntent({
        codeRaw: pricing.promoCode,
        paymentIntentId: paymentIntent.id,
        customerEmail: sanitizedEmail || null,
        transactionId: null,
        appliesTo: "esim",
      });
      if (!reservation.ok) {
        try {
          await getStripe().paymentIntents.cancel(paymentIntent.id);
        } catch {}
        return NextResponse.json({ error: reservation.error }, { status: 409 });
      }
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      productDetails: {
        name: sanitizeString(productName, 200),
        description: sanitizeString(productDescription, 500),
        originalPrice: (pricing.originalPriceCents / 100).toFixed(2),
        discountPercent: pricing.discountPercent,
        discountAmount: (pricing.discountAmountCents / 100).toFixed(2),
        finalPrice: (pricing.finalPriceCents / 100).toFixed(2),
        currency: currency,
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
      },
    }, {
      headers: {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetAt.toString()
      }
    });
  } catch (error) {
    console.error("[Stripe] Error creating payment intent:", error);
    // Don't expose internal error details to client
    return NextResponse.json(
      {
        error: "Failed to create payment intent. Please try again later."
      },
      { status: 500 }
    );
  }
}
