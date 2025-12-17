import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getEsimProducts } from "@/lib/esimaccess";
import {
  checkRateLimit,
  getClientIP,
  isValidEmail,
  isValidFullName,
  isValidOfferId,
  sanitizeString,
} from "@/lib/security";

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

    const sanitizedEmail = recipientEmail
      ? sanitizeString(String(recipientEmail).toLowerCase().trim(), 254)
      : undefined;
    const sanitizedFullName = fullName
      ? sanitizeString(String(fullName).trim(), 200)
      : undefined;

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

    const products = await getEsimProducts("SA");

    const resolved: Array<{
      offerId: string;
      quantity: number;
      productName: string;
      unitAmountCents: number;
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
      const currency = String(product.price.currency || "USD").toUpperCase();
      const productName = product.shortNotes || product.brandName || "eSIM Plan";

      resolved.push({
        offerId: item.offerId,
        quantity: item.quantity,
        productName,
        unitAmountCents,
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
    const totalQuantity = resolved.reduce((sum, r) => sum + r.quantity, 0);

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const cartItemsEncoded = encodeCartItems(items).slice(0, 500);

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: totalInCents,
        currency: currency.toLowerCase(),
        ...(sanitizedEmail && { receipt_email: sanitizedEmail }),
        metadata: {
          transactionId,
          cartItems: cartItemsEncoded,
          ...(sanitizedEmail && { recipientEmail: sanitizedEmail }),
          ...(sanitizedFullName && { fullName: sanitizedFullName }),
          productName: `Cart (${totalQuantity} eSIM${totalQuantity !== 1 ? "s" : ""})`,
        },
        description: `Cart purchase (${totalQuantity} eSIM${totalQuantity !== 1 ? "s" : ""})`,
        automatic_payment_methods: { enabled: true },
      },
      {
        idempotencyKey: `cart_${transactionId}`.substring(0, 255),
      },
    );

    return NextResponse.json(
      {
        clientSecret: paymentIntent.client_secret,
        summary: {
          currency,
          totalInCents,
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

