import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getEsimProducts } from "@/lib/esimcard";
import { 
  isValidEmail, 
  isValidOfferId, 
  isValidFullName, 
  sanitizeString,
  checkRateLimit,
  getClientIP
} from "@/lib/security";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

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

    const { offerId, recipientEmail, fullName } = await req.json();
    
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

    // Get product details from eSIMCard reseller API
    const products = await getEsimProducts();
    // Provider uses packageCode/slug as offerId
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

    // Calculate price in cents
    const priceAmount = product.price.fixed / (product.price.currencyDivisor || 100);
    const priceInCents = Math.round(priceAmount * 100);

    // Determine currency (convert to lowercase for Stripe)
    const currency = product.price.currency.toLowerCase();

    // Product display name and description
    const productName = product.shortNotes || product.brandName || 'eSIM Plan';
    const productDescription = `${product.dataUnlimited ? 'Unlimited' : `${product.dataGB}GB`} data • ${product.durationDays} days • ${product.country || 'Regional'}`;

    // Create Payment Intent
    const metadata: Record<string, string> = {
      offerId: sanitizedOfferId,
      productName: sanitizeString(productName, 200),
    };

    if (sanitizedEmail) metadata.recipientEmail = sanitizedEmail;
    if (sanitizedFullName) metadata.fullName = sanitizedFullName;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: priceInCents,
      currency: currency,
      ...(sanitizedEmail && { receipt_email: sanitizedEmail }),
      metadata,
      description: `${sanitizeString(productName, 200)} - ${sanitizeString(productDescription, 500)}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('[Stripe] Payment intent created:', paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      productDetails: {
        name: sanitizeString(productName, 200),
        description: sanitizeString(productDescription, 500),
        price: priceAmount,
        currency: currency,
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
