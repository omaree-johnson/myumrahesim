import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getEsimProducts } from "@/lib/esimcard";
import { auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/create-checkout-session
 * Creates a Stripe Checkout session for eSIM purchase
 *
 * Body: { offerId: string, recipientEmail: string, fullName: string }
 * Returns: { sessionId: string, url: string, transactionId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { offerId, recipientEmail, fullName } = await req.json();
    console.log('[Stripe] Creating checkout session for:', { offerId, recipientEmail, fullName });

    if (!offerId || !recipientEmail || !fullName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user ID from Clerk (if authenticated)
    let userId: string | undefined;
    try {
      const { userId: clerkUserId } = await auth();
      userId = clerkUserId || undefined;
    } catch (authError) {
      // User may not be authenticated, continue without userId
      console.log('[Stripe] No authenticated user');
    }

    // Generate unique transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Get product details from provider
    const products = await getEsimProducts();
    // Provider uses packageCode or slug as offerId
    const product = products.find((p: any) => 
      p.offerId === offerId || 
      p.packageCode === offerId || 
      p.slug === offerId
    );

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Calculate price in cents
    const priceAmount = product.price.fixed / (product.price.currencyDivisor || 100);
    const priceInCents = Math.round(priceAmount * 100);

    // Determine currency (convert to lowercase for Stripe)
    const currency = product.price.currency.toLowerCase();

    // Product display name
    const productName = product.shortNotes || product.brandName || 'eSIM Plan';
    const productDescription = `${product.dataUnlimited ? 'Unlimited' : `${product.dataGB}GB`} data • ${product.durationDays} days • ${product.country || 'Regional'}`;

    // Create Stripe Checkout Session
    const logoUrl = process.env.NEXT_PUBLIC_LOGO 
      ? `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_LOGO}` 
      : undefined;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: productName,
              description: productDescription,
              ...(logoUrl && { images: [logoUrl] }),
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: recipientEmail,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?product=${encodeURIComponent(offerId)}&name=${encodeURIComponent(productName)}&price=${encodeURIComponent(priceAmount.toFixed(2))}`,
      metadata: {
        offerId,
        recipientEmail,
        fullName,
        productName,
        transactionId,
        ...(userId && { userId }),
      },
    });

    console.log('[Stripe] Checkout session created:', session.id);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      transactionId,
    });
  } catch (error) {
    console.error("[Stripe] Error creating checkout session:", error);
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
