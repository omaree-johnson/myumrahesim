import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getCachedEsimProducts } from "@/lib/products-cache";
import { MIN_PROFIT_CENTS } from "@/lib/esimaccess";
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
  applyPercentDiscountWithFloor,
  normalizeDiscountCode,
  reserveDiscountForPaymentIntent,
  validateDiscountForContext,
} from "@/lib/discounts";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
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

    const products = await getCachedEsimProducts("SA");

    const resolved: Array<{
      offerId: string;
      quantity: number;
      productName: string;
      unitAmountCents: number;
      minUnitCents: number;
      currency: string;
    }> = [];

    for (const item of items) {
      const product = products.find(
        (p: any) => p.offerId === item.offerId || p.packageCode === item.offerId || p.slug === item.offerId,
      );
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.offerId}` }, { status: 404 });
      }

      const priceAmount = product.price.fixed / (product.price.currencyDivisor || 100);
      const unitAmountCents = Math.round(priceAmount * 100);
      const costCents =
        typeof (product as any)?.costPrice?.fixed === "number"
          ? Math.round((product as any).costPrice.fixed)
          : 0;
      const minUnitCents = Math.max(0, costCents + MIN_PROFIT_CENTS);
      const currency = String(product.price.currency || "USD").toUpperCase();
      const productName = product.shortNotes || product.brandName || "eSIM Plan";

      resolved.push({
        offerId: item.offerId,
        quantity: item.quantity,
        productName,
        unitAmountCents,
        minUnitCents,
        currency,
      });
    }

    const currency = resolved[0]?.currency || "USD";
    const hasMixedCurrency = resolved.some((r) => r.currency !== currency);
    if (hasMixedCurrency) {
      return NextResponse.json(
        { error: "Cart items must share the same currency" },
        { status: 400 },
      );
    }

    const totalInCents = resolved.reduce((sum, r) => sum + r.unitAmountCents * r.quantity, 0);
    const minTotalCents = resolved.reduce((sum, r) => sum + r.minUnitCents * r.quantity, 0);
    const totalQuantity = resolved.reduce((sum, r) => sum + r.quantity, 0);

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const cartItemsEncoded = encodeCartItems(items).slice(0, 500);

    let discount: null | {
      code: string;
      percentOff: number;
      discountAmountCents: number;
      discountedTotalCents: number;
    } = null;

    if (sanitizedDiscountCode) {
      const validation = await validateDiscountForContext({
        codeRaw: sanitizedDiscountCode,
        customerEmail: sanitizedEmail || null,
        transactionId: null,
        appliesTo: "cart",
      });
      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const calc = applyPercentDiscountWithFloor({
        totalCents: totalInCents,
        percentOff: validation.codeRow.percent_off,
        minTotalCents,
      });

      discount = {
        code: validation.codeRow.code,
        percentOff: validation.codeRow.percent_off,
        discountAmountCents: calc.discountAmountCents,
        discountedTotalCents: calc.discountedTotalCents,
      };
    }

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: discount ? discount.discountedTotalCents : totalInCents,
        currency: currency.toLowerCase(),
        ...(sanitizedEmail && { receipt_email: sanitizedEmail }),
        metadata: {
          transactionId,
          cartItems: cartItemsEncoded,
          ...(sanitizedCartToken && { cartToken: sanitizedCartToken }),
          ...(sanitizedEmail && { recipientEmail: sanitizedEmail }),
          ...(sanitizedFullName && { fullName: sanitizedFullName }),
          ...(discount && {
            discountCode: discount.code,
            discountPercentOff: String(discount.percentOff),
            discountAmountCents: String(discount.discountAmountCents),
          }),
          productName: `Cart (${totalQuantity} eSIM${totalQuantity !== 1 ? "s" : ""})`,
        },
        description: `Cart purchase (${totalQuantity} eSIM${totalQuantity !== 1 ? "s" : ""})`,
        automatic_payment_methods: { enabled: true },
      },
      {
        idempotencyKey: `cart_${transactionId}`.substring(0, 255),
      },
    );

    if (discount) {
      const reservation = await reserveDiscountForPaymentIntent({
        codeRaw: discount.code,
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
        summary: {
          currency,
          totalInCents: discount ? discount.discountedTotalCents : totalInCents,
          originalTotalInCents: totalInCents,
          ...(discount && {
            discountCode: discount.code,
            discountPercentOff: discount.percentOff,
            discountAmountCents: discount.discountAmountCents,
          }),
          totalQuantity,
          items: resolved.map((r) => ({
            offerId: r.offerId,
            quantity: r.quantity,
            productName: r.productName,
            unitAmount: r.unitAmountCents / 100,
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

