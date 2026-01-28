# Payment Security - Implementation Guide
**Date:** January 27, 2025

---

## Quick Start

### 1. Install Dependencies ✅
Already installed (no new dependencies needed)

### 2. Run Database Migration
```bash
# Execute: supabase/migrations/013_payment_intent_atomic_lock.sql
```

### 3. Update Endpoints
Follow the fixes in this document

---

## Step-by-Step Implementation

### Step 1: Create Secure Logging Utility ✅
**File:** `src/lib/secure-logging.ts` (CREATED)

Already created - use `secureLog()` instead of `console.log()`.

---

### Step 2: Create Payment Verification Utility ✅
**File:** `src/lib/payment-verification.ts` (CREATED)

Already created - use `verifyPaymentAmount()` in webhooks.

---

### Step 3: Update Payment Intent Creation

**File:** `src/app/api/create-payment-intent/route.ts`

```typescript
import { secureLog } from "@/lib/secure-logging";
import { randomUUID } from 'crypto';

// Generate secure idempotency key
function generateIdempotencyKey(
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
    // ... existing validation ...

    // Calculate expected price
    const expectedPriceCents = discount ? discount.discountedTotalCents : priceInCents;

    // Store expected price in metadata for webhook verification
    const metadata: Record<string, string> = {
      offerId: sanitizedOfferId,
      productName: sanitizeString(productName, 200),
      expectedPriceCents: String(expectedPriceCents), // ✅ CRITICAL: Store for verification
      expectedCurrency: currency,
      ...(sanitizedEmail && { recipientEmail: sanitizedEmail }),
      ...(sanitizedFullName && { fullName: sanitizedFullName }),
      ...(discount && {
        discountCode: discount.code,
        discountPercentOff: String(discount.percentOff),
        discountAmountCents: String(discount.discountAmountCents),
      }),
    };

    // Generate secure idempotency key
    const idempotencyKey = generateIdempotencyKey(
      sanitizedOfferId,
      sanitizedEmail,
      sanitizedDiscountCode
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: expectedPriceCents, // ✅ Use calculated price
      currency: currency,
      ...(sanitizedEmail && { receipt_email: sanitizedEmail }),
      metadata,
      description: `${sanitizeString(productName, 200)} - ${sanitizeString(productDescription, 500)}`,
      automatic_payment_methods: {
        enabled: true,
      },
    }, {
      idempotencyKey,
    });

    secureLog('info', 'Payment intent created', {
      paymentIntentId: paymentIntent.id,
      offerId: sanitizedOfferId,
      amount: expectedPriceCents,
      currency,
    });

    // ... rest of handler
  } catch (error) {
    secureLog('error', 'Payment intent creation failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    // ... error handling
  }
}
```

---

### Step 4: Update Webhook Handler

**File:** `src/app/api/webhooks/stripe/route.ts`

```typescript
import { 
  verifyPaymentAmount, 
  verifyCartPaymentAmount,
  validateWebhookTimestamp,
  isEventProcessed 
} from "@/lib/payment-verification";
import { secureLog, logSecurityEvent } from "@/lib/secure-logging";
import { markPaymentIntentProcessed } from "@/lib/payment-verification";

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

    // 2. Validate timestamp
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

    // 3. Check event deduplication
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
      
      const { isSupabaseAdminReady, supabaseAdmin } = await import('@/lib/supabase');
      if (isSupabaseAdminReady()) {
        // Use database function for atomic operation
        const { data: marked, error: markError } = await supabaseAdmin.rpc(
          'mark_payment_intent_processed',
          {
            p_payment_intent_id: paymentIntent.id,
            p_transaction_id: transactionId,
          }
        );

        if (markError) {
          secureLog('error', 'Failed to mark payment intent processed', {
            paymentIntentId: paymentIntent.id,
            error: markError.message,
          });
          // Continue processing - will fail on duplicate insert
        } else if (!marked) {
          // Already processed
          secureLog('info', 'Payment intent already processed', {
            paymentIntentId: paymentIntent.id,
          });
          return NextResponse.json({
            received: true,
            duplicate: true,
            message: 'Payment intent already processed',
          });
        }
      }

      // 7. Verify price
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
          await logSecurityEvent('fraud_cart_price_mismatch', {
            paymentIntentId: paymentIntent.id,
            details: cartVerification,
          });

          return NextResponse.json(
            { error: 'Price verification failed' },
            { status: 400 }
          );
        }
      } else if (offerId) {
        // Verify single product payment
        const priceVerification = await verifyPaymentAmount(
          paymentIntent,
          offerId,
          discountCode
        );

        if (!priceVerification.valid) {
          await logSecurityEvent('fraud_price_mismatch', {
            paymentIntentId: paymentIntent.id,
            details: priceVerification,
          });

          return NextResponse.json(
            { error: 'Price verification failed' },
            { status: 400 }
          );
        }
      }

      // 8. Process fulfillment
      const result = await processPaymentAndFulfill(paymentIntent);

      // 9. Mark event as processed
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

### Step 5: Update Update Payment Intent Endpoint

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
          { error: "Unauthorized" },
          { status: 403 }
        );
      }
    }

    // 5. Check payment status
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

### Step 6: Update All Logging

Replace all `console.log()` with `secureLog()`:

```typescript
// Before
console.log('[Stripe] Creating payment intent for:', { 
  offerId, 
  recipientEmail, // ❌ PII exposed
  fullName // ❌ PII exposed
});

// After
secureLog('info', 'Creating payment intent', {
  offerId,
  recipientEmail, // ✅ Automatically sanitized
  fullName, // ✅ Automatically sanitized
});
```

---

## Testing

### Test Price Verification
```typescript
// Create payment intent with correct price
const pi1 = await createPaymentIntent({ offerId: 'CKH036' });
// Should succeed

// Try to create with manipulated price (should fail in webhook)
// This is prevented by Stripe, but verify webhook checks it
```

### Test Race Condition
```bash
# Send same webhook event twice simultaneously
# Should only process once
```

### Test Timestamp Validation
```typescript
// Create old event (should be rejected)
const oldEvent = {
  ...event,
  created: Math.floor(Date.now() / 1000) - 600, // 10 minutes ago
};
```

---

## Verification Checklist

- [ ] Prices calculated server-side only
- [ ] Expected prices stored in metadata
- [ ] Price verification in webhook
- [ ] Timestamp validation
- [ ] Event deduplication
- [ ] Race condition prevention
- [ ] All logs sanitized
- [ ] Update endpoint secured
- [ ] Idempotency keys secure

---

**See Full Audit:** `docs/PAYMENT_SECURITY_AUDIT.md`
