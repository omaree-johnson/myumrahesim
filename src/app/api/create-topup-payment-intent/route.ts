import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getTopUpPackagesByIccid } from "@/lib/esimaccess";
import {
  checkRateLimit,
  getClientIP,
  isValidEmail,
  isValidFullName,
  sanitizeString,
} from "@/lib/security";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isValidIccid(iccid: string) {
  // ICCIDs are typically 19-20 digits; accept digits only here.
  return /^[0-9]{18,22}$/.test(iccid);
}

/**
 * POST /api/create-topup-payment-intent
 * Body: { iccid: string, packageCode: string, recipientEmail?: string, fullName?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(`topup-payment-intent:${clientIP}`, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { iccid, packageCode, recipientEmail, fullName } = await req.json();
    const sanitizedIccid = sanitizeString(String(iccid || "").trim(), 32);
    const sanitizedPackageCode = sanitizeString(String(packageCode || "").trim(), 100);
    const sanitizedEmail = recipientEmail
      ? sanitizeString(String(recipientEmail).toLowerCase().trim(), 254)
      : undefined;
    const sanitizedFullName = fullName ? sanitizeString(String(fullName).trim(), 200) : undefined;

    if (!sanitizedIccid || !isValidIccid(sanitizedIccid)) {
      return NextResponse.json({ error: "Invalid ICCID" }, { status: 400 });
    }
    if (!sanitizedPackageCode) {
      return NextResponse.json({ error: "Missing packageCode" }, { status: 400 });
    }
    if (sanitizedEmail && !isValidEmail(sanitizedEmail)) {
      return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
    }
    if (sanitizedFullName && !isValidFullName(sanitizedFullName)) {
      return NextResponse.json({ error: "Invalid name format" }, { status: 400 });
    }

    const topups = await getTopUpPackagesByIccid(sanitizedIccid);
    const selected = topups.find(
      (p) => p.packageCode === sanitizedPackageCode || p.slug === sanitizedPackageCode,
    );
    if (!selected) {
      return NextResponse.json({ error: "Top up package not found for this eSIM" }, { status: 404 });
    }

    const priceInCents = selected.price.fixed;
    const currency = selected.price.currency.toLowerCase();

    const transactionId = `topup_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: priceInCents,
      currency,
      ...(sanitizedEmail && { receipt_email: sanitizedEmail }),
      metadata: {
        transactionId,
        topupIccid: sanitizedIccid,
        topupPackageCode: selected.packageCode,
        ...(sanitizedEmail && { recipientEmail: sanitizedEmail }),
        ...(sanitizedFullName && { fullName: sanitizedFullName }),
        productName: `Top Up (${selected.packageCode})`,
      },
      description: `eSIM top up (${selected.packageCode})`,
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      summary: {
        transactionId,
        iccid: sanitizedIccid,
        packageCode: selected.packageCode,
        currency: selected.price.currency,
        price: (priceInCents / 100).toFixed(2),
      },
    });
  } catch (error) {
    console.error("[Stripe] Error creating top up payment intent:", error);
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}

