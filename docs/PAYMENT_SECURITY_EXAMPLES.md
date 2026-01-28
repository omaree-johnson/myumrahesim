# Payment Security - Complete Code Examples
**Date:** January 27, 2025

---

## Example 1: Secure Payment Intent Creation

**File:** `src/app/api/create-payment-intent/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getCachedEsimProducts } from "@/lib/products-cache";
import { MIN_PROFIT_CENTS } from "@/lib/esimaccess";
import { secureLog } from "@/lib/secure-logging";
import { randomUUID } from 'crypto';
import { CreatePaymentIntentSchema } from "@/lib/validation-schemas";
import { validateRequestBody } from "@/lib/request-validation";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

function generateSecureIdempotencyKey(
  offerId: string,
  email: string | undefined,
  discountCode: string | undefined
): string {
  const uuid = randomUUID();
  const timestamp = Date.now();
  const key = `pi_${offerId}_${email ? email.substring(0, 3) : 'noemail'}_${discountCode || 'nodisc'}_${timestamp}_${uuid}`;
  return key.substring(0, 255); // Stripe limit
}

export async function POST(req: NextRequest) {
  try {
    // 1. Validate request body
    const validation = await validateRequestBody(req, CreatePaymentIntentSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { offerId, recipientEmail, fullName, discountCode } = validation.data;

    // 2. Get product and calculate price (server-side only)
    const products = await getCachedEsimProducts("SA");
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

    // 3. Calculate price server-side
    const priceAmount = product.price.fixed / (product.price.currencyDivisor || 100);
    const priceInCents = Math.round(priceAmount * 100);
    const costCents = typeof (product as any)?.costPrice?.fixed === "number"
      ? Math.round((product as any).costPrice.fixed)
      : null;
    const minSellCents = costCents !== null ? costCents + MIN_PROFIT_CENTS : 0;

    // 4. Apply discount if valid
    let discount = null;
    if (discountCode) {
      const validation = await validateDiscountForContext({
        codeRaw: discountCode,
        customerEmail: recipientEmail || null,
        transactionId: null,
        appliesTo: "esim",
      });
      
      if (validation.ok) {
        const calc = applyPercentDiscountWithFloor({
          totalCents: priceInCents,
          percentOff: validation.codeRow.percent_off,
          minTotalCents: minSellCents,
        });
        discount = {
          code: validation.codeRow.code,
          percentOff: validation.codeRow.percent_off,
          discountAmountCents: calc.discountAmountCents,
          discountedTotalCents: calc.discountedTotalCents,
        };
      }
    }

    // 5. Calculate final expected price
    const expectedPriceCents = discount ? discount.discountedTotalCents : priceInCents;

    // 6. Store expected price in metadata for webhook verification
    const metadata: Record<string, string> = {
      offerId,
      productName: product.shortNotes || product.brandName || 'eSIM Plan',
      expectedPriceCents: String(expectedPriceCents), // ✅ CRITICAL: Store for verification
      expectedCurrency: product.price.currency.toLowerCase(),
      ...(recipientEmail && { recipientEmail }),
      ...(fullName && { fullName }),
      ...(discount && {
        discountCode: discount.code,
        discountPercentOff: String(discount.percentOff),
        discountAmountCents: String(discount.discountAmountCents),
      }),
    };

    // 7. Generate secure idempotency key
    const idempotencyKey = generateSecureIdempotencyKey(
      offerId,
      recipientEmail,
      discountCode
    );

    // 8. Create payment intent with calculated price
    const paymentIntent = await stripe.paymentIntents.create({
      amount: expectedPriceCents, // ✅ Always use server-calculated price
      currency: product.price.currency.toLowerCase(),
      ...(recipientEmail && { receipt_email: recipientEmail }),
      metadata,
      description: `${product.shortNotes || 'eSIM Plan'}`,
      automatic_payment_methods: {
        enabled: true,
      },
    }, {
      idempotencyKey,
    });

    secureLog('info', 'Payment intent created', {
      paymentIntentId: paymentIntent.id,
      offerId,
      amount: expectedPriceCents,
      currency: product.price.currency,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      productDetails: {
        name: product.shortNotes || 'eSIM Plan',
        price: priceAmount,
        currency: product.price.currency.toLowerCase(),
        ...(discount && {
          discountCode: discount.code,
          discountPercentOff: discount.percentOff,
          discountAmount: (discount.discountAmountCents / 100).toFixed(2),
          totalAfterDiscount: (discount.discountedTotalCents / 100).toFixed(2),
        }),
      },
    });
  } catch (error) {
    secureLog('error', 'Payment intent creation failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
```

---

## Example 2: Secure Webhook Handler

**File:** `src/app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  verifyPaymentAmount,
  verifyCartPaymentAmount,
  validateWebhookTimestamp,
  isEventProcessed,
  markPaymentIntentProcessedAtomically,
} from "@/lib/payment-verification";
import { secureLog } from "@/lib/secure-logging";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    // 1. Verify signature
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      secureLog('error', 'Webhook missing signature');
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      secureLog('info', 'Webhook signature verified', {
        eventId: event.id,
        eventType: event.type,
      });
    } catch (err) {
      secureLog('error', 'Webhook signature verification failed', {
        error: err instanceof Error ? err.message : String(err),
      });
      return NextResponse.json(
        { error: "Signature verification failed" },
        { status: 400 }
      );
    }

    // 2. Validate timestamp (reject events older than 5 minutes)
    const timestampValidation = validateWebhookTimestamp(event);
    if (!timestampValidation.valid) {
      secureLog('warn', 'Webhook timestamp validation failed', {
        eventId: event.id,
        eventAge: timestampValidation.ageSeconds,
      });
      return NextResponse.json(
        { error: 'Event timestamp validation failed' },
        { status: 400 }
      );
    }

    // 3. Check event deduplication (prevent replay attacks)
    const alreadyProcessed = await isEventProcessed(event.id, 'stripe');
    if (alreadyProcessed) {
      secureLog('info', 'Webhook event already processed', {
        eventId: event.id,
      });
      return NextResponse.json({
        received: true,
        duplicate: true,
      });
    }

    // 4. Log event
    const { logWebhookEvent } = await import('@/lib/supabase-logging');
    await logWebhookEvent({
      eventId: event.id,
      eventType: event.type,
      source: 'stripe',
      payload: event.data.object,
    });

    // 5. Process payment_intent.succeeded
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      secureLog('info', 'Payment intent succeeded', {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      });

      // 6. Atomically check and mark as processed (prevents race condition)
      const transactionId = paymentIntent.metadata?.transactionId || 
        `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      const atomicResult = await markPaymentIntentProcessedAtomically(
        paymentIntent.id,
        transactionId
      );

      if (atomicResult.alreadyProcessed) {
        secureLog('info', 'Payment intent already processed', {
          paymentIntentId: paymentIntent.id,
        });
        return NextResponse.json({
          received: true,
          duplicate: true,
          message: 'Payment intent already processed',
        });
      }

      if (!atomicResult.success) {
        secureLog('error', 'Failed to mark payment intent processed', {
          paymentIntentId: paymentIntent.id,
        });
        // Continue - will fail on duplicate insert
      }

      // 7. Verify payment amount matches expected price
      const offerId = paymentIntent.metadata?.offerId;
      const discountCode = paymentIntent.metadata?.discountCode || null;
      const cartItems = parseCartItems(paymentIntent.metadata?.cartItems);

      if (cartItems.length > 0) {
        // Verify cart payment
        const cartVerification = await verifyCartPaymentAmount(
          paymentIntent,
          cartItems,
          discountCode
        );

        if (!cartVerification.valid) {
          const { logSecurityEvent } = await import('@/lib/secure-logging');
          await logSecurityEvent('fraud_cart_price_mismatch', {
            paymentIntentId: paymentIntent.id,
            details: cartVerification,
          });

          return NextResponse.json(
            { error: 'Price verification failed' },
            { status: 400 }
          );
        }

        secureLog('info', 'Cart price verified', {
          paymentIntentId: paymentIntent.id,
          paidAmount: paymentIntent.amount,
          expectedPrice: cartVerification.expectedPrice,
        });
      } else if (offerId) {
        // Verify single product payment
        const priceVerification = await verifyPaymentAmount(
          paymentIntent,
          offerId,
          discountCode
        );

        if (!priceVerification.valid) {
          const { logSecurityEvent } = await import('@/lib/secure-logging');
          await logSecurityEvent('fraud_price_mismatch', {
            paymentIntentId: paymentIntent.id,
            details: priceVerification,
          });

          return NextResponse.json(
            { error: 'Price verification failed' },
            { status: 400 }
          );
        }

        secureLog('info', 'Price verified', {
          paymentIntentId: paymentIntent.id,
          paidAmount: paymentIntent.amount,
          expectedPrice: priceVerification.expectedPrice,
        });
      }

      // 8. Process fulfillment
      const result = await processPaymentAndFulfill(paymentIntent);

      // 9. Mark event as processed
      const { markWebhookEventProcessed } = await import('@/lib/supabase-logging');
      await markWebhookEventProcessed(event.id, 'stripe');

      secureLog('info', 'Payment processing completed', {
        paymentIntentId: paymentIntent.id,
        transactionId: result.transactionId,
      });

      return NextResponse.json({
        received: true,
        success: true,
        transactionId: result.transactionId,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    secureLog('error', 'Webhook processing error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## Example 3: Secure Update Payment Intent

**File:** `src/app/api/update-payment-intent/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { UpdatePaymentIntentSchema } from "@/lib/validation-schemas";
import { validateRequestBody } from "@/lib/request-validation";
import { secureLog } from "@/lib/secure-logging";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export async function POST(req: NextRequest) {
  try {
    // 1. Validate request body
    const validation = await validateRequestBody(req, UpdatePaymentIntentSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { paymentIntentId, email, fullName } = validation.data;

    // 2. Get user ID if authenticated
    let userId: string | null = null;
    try {
      const { userId: clerkUserId } = await auth();
      userId = clerkUserId || null;
    } catch {}

    // 3. Retrieve payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // 4. Verify ownership (if authenticated)
    if (userId && paymentIntent.metadata?.userId) {
      if (paymentIntent.metadata.userId !== userId) {
        secureLog('warn', 'Unauthorized payment intent update attempt', {
          paymentIntentId: paymentIntent.id,
          attemptedUserId: userId,
          ownerUserId: paymentIntent.metadata.userId,
        });

        return NextResponse.json(
          { error: "Unauthorized - You do not own this payment intent" },
          { status: 403 }
        );
      }
    }

    // 5. Check payment status (can't update if already succeeded/canceled)
    if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'canceled') {
      return NextResponse.json(
        { error: `Cannot update payment intent with status: ${paymentIntent.status}` },
        { status: 400 }
      );
    }

    // 6. Update payment intent
    const updatedIntent = await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        ...paymentIntent.metadata,
        recipientEmail: email.trim(),
        ...(fullName && { fullName: fullName.trim() }),
      },
      receipt_email: email.trim(),
    });

    secureLog('info', 'Payment intent updated', {
      paymentIntentId: updatedIntent.id,
      status: updatedIntent.status,
    });

    return NextResponse.json({
      success: true,
      paymentIntentId: updatedIntent.id,
    });
  } catch (error) {
    secureLog('error', 'Payment intent update failed', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: "Failed to update payment intent" },
      { status: 500 }
    );
  }
}
```

---

## Example 4: Secure Cart Payment Intent

**File:** `src/app/api/create-cart-payment-intent/route.ts`

```typescript
// ... existing code ...

// After calculating totalInCents:
const expectedPriceCents = discount ? discount.discountedTotalCents : totalInCents;

// Store in metadata
const metadata: Record<string, string> = {
  transactionId,
  cartItems: cartItemsEncoded,
  expectedPriceCents: String(expectedPriceCents), // ✅ CRITICAL: Store for verification
  expectedCurrency: currency,
  ...(sanitizedCartToken && { cartToken: sanitizedCartToken }),
  ...(sanitizedEmail && { recipientEmail: sanitizedEmail }),
  ...(sanitizedFullName && { fullName: sanitizedFullName }),
  ...(discount && {
    discountCode: discount.code,
    discountPercentOff: String(discount.percentOff),
    discountAmountCents: String(discount.discountAmountCents),
  }),
  productName: cartProductNameTruncated,
};

const paymentIntent = await stripe.paymentIntents.create({
  amount: expectedPriceCents, // ✅ Use calculated price
  currency: currency.toLowerCase(),
  metadata,
  // ... rest of config
});
```

---

## Example 5: Replace All Logging

**Before:**
```typescript
console.log('[Stripe] Creating payment intent for:', { 
  offerId, 
  recipientEmail, // ❌ PII exposed
  fullName // ❌ PII exposed
});

console.log('[Stripe Webhook] Email details:', {
  to: recipientEmail, // ❌ PII exposed
  customerName: fullName, // ❌ PII exposed
  price: `${currencyCode} ${(priceInCents / 100).toFixed(2)}`, // ❌ Payment amount
});
```

**After:**
```typescript
import { secureLog } from "@/lib/secure-logging";

secureLog('info', 'Creating payment intent', {
  offerId,
  recipientEmail, // ✅ Automatically sanitized to "us***@example.com"
  fullName, // ✅ Automatically sanitized to "J***e"
});

secureLog('info', 'Email details', {
  to: recipientEmail, // ✅ Automatically sanitized
  customerName: fullName, // ✅ Automatically sanitized
  price: priceInCents, // ✅ Automatically sanitized to range like "$10-$50"
});
```

---

## Validation Logic Summary

### Price Verification
```typescript
// 1. Get expected price from metadata (if stored)
const expectedPrice = paymentIntent.metadata?.expectedPriceCents;

// 2. If not in metadata, calculate from product
const packageData = await getEsimPackage(offerId);
const calculatedPrice = calculatePrice(packageData);

// 3. Apply discount if present
const finalPrice = applyDiscount(calculatedPrice, discountCode);

// 4. Verify paid amount matches expected
if (Math.abs(paidAmount - finalPrice) > 1) {
  // Price mismatch - fraud detected
  throw new Error('Price verification failed');
}
```

### Timestamp Validation
```typescript
const eventAge = Date.now() / 1000 - event.created;
if (eventAge > 5 * 60) { // 5 minutes
  throw new Error('Event too old');
}
```

### Atomic Processing
```typescript
// Use database function with row-level locking
const { data } = await supabase.rpc('mark_payment_intent_processed', {
  p_payment_intent_id: paymentIntentId,
  p_transaction_id: transactionId,
});

if (!data) {
  // Already processed
  return { duplicate: true };
}
```

---

**See Full Implementation:** `docs/PAYMENT_SECURITY_IMPLEMENTATION.md`
