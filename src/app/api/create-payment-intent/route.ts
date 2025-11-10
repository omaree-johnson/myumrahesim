import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getEsimProducts } from "@/lib/zendit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/create-payment-intent
 * Creates a Stripe Payment Intent for embedded checkout
 * 
 * Body: { offerId: string, recipientEmail: string, fullName: string }
 * Returns: { clientSecret: string, productDetails: object }
 */
export async function POST(req: NextRequest) {
  try {
    const { offerId, recipientEmail, fullName } = await req.json();
    console.log('[Stripe] Creating payment intent for:', { offerId, recipientEmail, fullName });

    if (!offerId || !recipientEmail || !fullName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get product details from Zendit
    const products = await getEsimProducts();
    const product = products.find((p: any) => p.offerId === offerId);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Calculate price in cents
    const priceAmount = product.price.fixed / product.price.currencyDivisor;
    const priceInCents = Math.round(priceAmount * 100);

    // Determine currency (convert to lowercase for Stripe)
    const currency = product.price.currency.toLowerCase();

    // Product display name and description
    const productName = product.shortNotes || product.brandName || 'eSIM Plan';
    const productDescription = `${product.dataUnlimited ? 'Unlimited' : `${product.dataGB}GB`} data • ${product.durationDays} days • ${product.country || 'Regional'}`;

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: priceInCents,
      currency: currency,
      receipt_email: recipientEmail,
      metadata: {
        offerId,
        recipientEmail,
        fullName,
        productName,
      },
      description: `${productName} - ${productDescription}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('[Stripe] Payment intent created:', paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      productDetails: {
        name: productName,
        description: productDescription,
        price: priceAmount,
        currency: currency,
      },
    });
  } catch (error) {
    console.error("[Stripe] Error creating payment intent:", error);
    return NextResponse.json(
      {
        error: "Failed to create payment intent",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
