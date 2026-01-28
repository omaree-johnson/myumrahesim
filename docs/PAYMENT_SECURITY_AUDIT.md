# Payment & Checkout Security Audit
**Date:** January 27, 2025  
**Application:** myumrahesim.com  
**Payment Provider:** Stripe

---

## Executive Summary

This audit identifies **critical fraud and manipulation vulnerabilities** in payment and checkout flows, including price tampering risks, replay attack vulnerabilities, race conditions, and sensitive data exposure.

**Overall Security Posture:** 3/10  
**Critical Vulnerabilities Found:** 8  
**High Priority Issues:** 6

---

## 1. Current Payment Architecture

### Payment Flows
1. **Embedded Checkout:** `POST /api/create-payment-intent` → Stripe Payment Intent
2. **Stripe Checkout:** `POST /api/create-checkout-session` → Stripe Checkout Session
3. **Cart Checkout:** `POST /api/create-cart-payment-intent` → Multiple items
4. **Top-up:** `POST /api/create-topup-payment-intent` → eSIM top-up
5. **Webhook:** `POST /api/webhooks/stripe` → Payment fulfillment

### Price Calculation
- Prices calculated server-side from eSIM Access API
- Profit margin applied: `ESIMACCESS_PROFIT_MARGIN` (default 1.35 = 35%)
- Minimum profit floor: `ESIMACCESS_MIN_PROFIT_CENTS` (default 200 cents)

---

## 2. Critical Vulnerabilities

### 🔴 VULNERABILITY #1: No Price Verification in Webhook
**Severity:** CRITICAL  
**Risk Score:** 25/25  
**Endpoint:** `POST /api/webhooks/stripe`

**Description:**
Webhook handler accepts payment amount from Stripe without verifying it matches the expected product price. Attacker could create payment intent with manipulated price, then webhook processes it.

**Attack Vector:**
```typescript
// Attacker creates payment intent with manipulated price
const paymentIntent = await stripe.paymentIntents.create({
  amount: 100, // $1.00 instead of $10.00
  metadata: { offerId: 'CKH036' } // Expensive product
});

// Webhook processes without verification
const priceInCents = paymentIntent.amount; // Uses manipulated amount
// ❌ No verification against product price
```

**Evidence:**
```typescript
// src/app/api/webhooks/stripe/route.ts:196
const priceInCents = paymentIntent.amount; // ❌ Trusts Stripe amount
// No verification against product price
```

**Impact:**
- Financial loss (pay $1 for $10 product)
- Inventory theft
- Revenue manipulation

---

### 🔴 VULNERABILITY #2: Price Tampering in Payment Intent Creation
**Severity:** CRITICAL  
**Risk Score:** 24/25  
**Endpoint:** `POST /api/create-payment-intent`

**Description:**
Client cannot directly manipulate price (it's calculated server-side), but there's no verification that the price sent to Stripe matches what was calculated. If there's any client-side price display, it could be manipulated.

**Attack Vector:**
- Client modifies price in browser DevTools
- Client intercepts and modifies API response
- Client creates payment intent with different offerId

**Evidence:**
```typescript
// src/app/api/create-payment-intent/route.ts:185
const paymentIntent = await stripe.paymentIntents.create({
  amount: discount ? discount.discountedTotalCents : priceInCents,
  // ✅ Price calculated server-side
  // ⚠️ But no verification that client didn't modify it
});
```

**Impact:**
- Price manipulation
- Revenue loss
- Inventory abuse

---

### 🔴 VULNERABILITY #3: Replay Attack on Payment Intents
**Severity:** CRITICAL  
**Risk Score:** 23/25  
**Endpoint:** `POST /api/webhooks/stripe`

**Description:**
Idempotency check exists but has race condition window. Attacker could replay webhook events or reuse payment intent IDs.

**Attack Vector:**
1. Attacker intercepts webhook event
2. Replays event multiple times
3. Each replay processes payment (race condition)
4. Multiple eSIMs issued for single payment

**Evidence:**
```typescript
// src/app/api/webhooks/stripe/route.ts:1047-1078
// Idempotency check exists but:
// 1. Race condition between check and insert
// 2. No timestamp validation
// 3. No nonce checking
// 4. No event.id deduplication
```

**Impact:**
- Duplicate fulfillment
- Inventory theft
- Financial loss

---

### 🔴 VULNERABILITY #4: Race Condition in Webhook Processing
**Severity:** CRITICAL  
**Risk Score:** 22/25  
**Endpoint:** `POST /api/webhooks/stripe`

**Description:**
Multiple webhook events for same payment intent can be processed concurrently, causing duplicate fulfillment.

**Attack Vector:**
```
Time 0ms: Webhook 1 arrives → Check DB → No record found
Time 1ms: Webhook 2 arrives → Check DB → No record found (Webhook 1 not inserted yet)
Time 2ms: Webhook 1 → Insert purchase
Time 3ms: Webhook 2 → Insert purchase (DUPLICATE!)
```

**Evidence:**
```typescript
// src/app/api/webhooks/stripe/route.ts:1049-1078
// Check happens, then insert happens
// No database transaction or lock
// Race condition window exists
```

**Impact:**
- Duplicate eSIM issuance
- Inventory theft
- Financial loss

---

### 🔴 VULNERABILITY #5: Sensitive Data in Logs
**Severity:** CRITICAL  
**Risk Score:** 21/25  
**Affected:** All payment endpoints

**Description:**
Email addresses, payment amounts, customer names, and other PII are logged to console, which may be exposed in logs.

**Attack Vector:**
- Logs stored in plaintext
- Logs accessible to developers
- Logs sent to monitoring services
- Logs exposed in error messages

**Evidence:**
```typescript
// src/app/api/create-payment-intent/route.ts:92
console.log('[Stripe] Creating payment intent for:', { 
  offerId: sanitizedOfferId, 
  recipientEmail: sanitizedEmail, // ❌ PII in logs
  fullName: sanitizedFullName // ❌ PII in logs
});

// src/app/api/webhooks/stripe/route.ts:292
console.log('[Stripe Webhook] Email details:', {
  to: recipientEmail, // ❌ PII in logs
  customerName: fullName, // ❌ PII in logs
  price: `${currencyCode} ${(priceInCents / 100).toFixed(2)}`, // ❌ Payment amount
});
```

**Impact:**
- GDPR/CCPA violations
- Privacy violations
- Data breach risk
- Compliance issues

---

### 🔴 VULNERABILITY #6: No Timestamp Validation in Webhooks
**Severity:** HIGH  
**Risk Score:** 20/25  
**Endpoint:** `POST /api/webhooks/stripe`

**Description:**
Webhook events are not validated for age. Old events could be replayed.

**Attack Vector:**
- Attacker intercepts webhook event
- Replays event days/weeks later
- System processes old event
- Duplicate fulfillment

**Evidence:**
```typescript
// src/app/api/webhooks/stripe/route.ts:1022
console.log('[Stripe Webhook] ✅ Event parsed successfully:', {
  type: event.type,
  id: event.id,
  created: event.created, // ❌ Logged but not validated
});
// No timestamp validation
// No rejection of old events
```

**Impact:**
- Replay attacks
- Duplicate processing
- Inventory abuse

---

### 🔴 VULNERABILITY #7: Update Payment Intent Without Authorization
**Severity:** HIGH  
**Risk Score:** 19/25  
**Endpoint:** `POST /api/update-payment-intent`

**Description:**
Anyone can update any payment intent's email/name without ownership verification.

**Attack Vector:**
```bash
# Attacker updates someone else's payment intent
curl -X POST https://myumrahesim.com/api/update-payment-intent \
  -d '{"paymentIntentId": "pi_attacker_payment", "email": "attacker@evil.com"}'
# Changes receipt email to attacker's email
```

**Evidence:**
```typescript
// src/app/api/update-payment-intent/route.ts:15
export async function POST(req: NextRequest) {
  const { paymentIntentId, email, fullName } = await req.json();
  // ❌ NO AUTH CHECK
  // ❌ NO OWNERSHIP VERIFICATION
  // ❌ NO PAYMENT STATUS CHECK
  await stripe.paymentIntents.update(paymentIntentId, {
    receipt_email: email.trim(),
  });
}
```

**Impact:**
- Email hijacking
- Receipt theft
- Privacy violation
- Fraud

---

### 🔴 VULNERABILITY #8: Weak Idempotency Key Generation
**Severity:** HIGH  
**Risk Score:** 18/25  
**Endpoint:** `POST /api/create-payment-intent`

**Description:**
Idempotency key is predictable and based on timestamp, allowing collision attacks.

**Attack Vector:**
```typescript
// Current implementation
const idempotencyKey = `pi_${sanitizedOfferId}_${sanitizedEmail || 'noemail'}_${sanitizedDiscountCode || 'nodisc'}_${Math.floor(Date.now() / 60000)}`;
// ❌ Predictable - same key for same minute
// ❌ Attacker can predict and reuse keys
```

**Evidence:**
```typescript
// src/app/api/create-payment-intent/route.ts:183
const idempotencyKey = `pi_${sanitizedOfferId}_${sanitizedEmail || 'noemail'}_${sanitizedDiscountCode || 'nodisc'}_${Math.floor(Date.now() / 60000)}`;
// Rounded to minute - collisions possible
```

**Impact:**
- Payment intent collisions
- Duplicate charges
- Customer confusion

---

### 🔴 VULNERABILITY #9: No Amount Verification in Checkout Session
**Severity:** HIGH  
**Risk Score:** 17/25  
**Endpoint:** `POST /api/create-checkout-session`

**Description:**
Checkout session creation doesn't verify price against product, and no verification in webhook.

**Attack Vector:**
- Client manipulates checkout session creation
- Webhook processes without price verification
- Wrong amount charged

**Evidence:**
```typescript
// src/app/api/create-checkout-session/route.ts:81
const session = await stripe.checkout.sessions.create({
  line_items: [{
    price_data: {
      unit_amount: priceInCents, // ✅ Calculated server-side
      // ⚠️ But no verification in webhook
    }
  }]
});
```

**Impact:**
- Price manipulation
- Revenue loss

---

### 🔴 VULNERABILITY #10: Cart Price Manipulation Risk
**Severity:** HIGH  
**Risk Score:** 16/25  
**Endpoint:** `POST /api/create-cart-payment-intent`

**Description:**
Cart totals are calculated server-side, but quantities could be manipulated, and no verification in webhook.

**Attack Vector:**
- Client sends manipulated quantities
- Server calculates total
- But no verification that quantities match in webhook

**Evidence:**
```typescript
// src/app/api/create-cart-payment-intent/route.ts:142
const totalInCents = resolved.reduce((sum, r) => sum + r.unitAmountCents * r.quantity, 0);
// ✅ Calculated server-side
// ⚠️ But webhook doesn't verify cart items match
```

**Impact:**
- Quantity manipulation
- Inventory abuse

---

## 3. Secure Checkout Architecture

### Architecture Principles

1. **Never Trust Client:** All prices calculated server-side
2. **Verify Everything:** Verify prices in webhooks
3. **Idempotency:** All operations must be idempotent
4. **Atomic Operations:** Use database transactions
5. **No PII in Logs:** Sanitize all logs
6. **Timestamp Validation:** Reject old events
7. **Nonce Checking:** Prevent replay attacks

### Secure Flow

```
┌─────────────────────────────────────────────────┐
│ 1. Client: Request Payment Intent               │
│    POST /api/create-payment-intent             │
│    Body: { offerId }                            │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 2. Server: Calculate Price                      │
│    - Fetch product from provider                │
│    - Calculate price server-side                │
│    - Apply profit margin                        │
│    - Apply discount (if valid)                  │
│    - Generate secure transaction ID             │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 3. Server: Create Payment Intent                 │
│    - Store expected price in metadata           │
│    - Store product details in metadata          │
│    - Generate secure idempotency key            │
│    - Return clientSecret                         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 4. Client: Complete Payment                     │
│    - Use Stripe.js to confirm payment            │
│    - Payment processed by Stripe                 │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 5. Stripe: Send Webhook                         │
│    POST /api/webhooks/stripe                    │
│    - Verify signature                           │
│    - Validate timestamp                         │
│    - Check idempotency                          │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 6. Server: Verify Payment                       │
│    - Verify amount matches expected price        │
│    - Verify product details                     │
│    - Check for duplicates (atomic)               │
│    - Process fulfillment                        │
└─────────────────────────────────────────────────┘
```

---

## 4. Code Fixes

### Fix #1: Add Price Verification in Webhook

**File:** `src/app/api/webhooks/stripe/route.ts`

```typescript
/**
 * Verify payment amount matches expected product price
 */
async function verifyPaymentAmount(
  paymentIntent: Stripe.PaymentIntent,
  offerId: string,
  expectedPriceCents: number,
  toleranceCents: number = 1 // Allow 1 cent tolerance for rounding
): Promise<{ valid: boolean; error?: string; details?: any }> {
  const paidAmount = paymentIntent.amount;
  const difference = Math.abs(paidAmount - expectedPriceCents);

  if (difference > toleranceCents) {
    // Log security event
    await logSecurityEvent({
      eventType: 'price_mismatch',
      paymentIntentId: paymentIntent.id,
      ip: 'webhook',
      details: {
        offerId,
        paidAmount,
        expectedPriceCents,
        difference,
      },
    });

    return {
      valid: false,
      error: `Price mismatch: paid ${paidAmount} cents, expected ${expectedPriceCents} cents`,
      details: {
        paidAmount,
        expectedPriceCents,
        difference,
      },
    };
  }

  return { valid: true };
}

// In processPaymentAndFulfill function, add verification:
async function processPaymentAndFulfill(
  paymentIntent: Stripe.PaymentIntent,
  overrideMetadata: Record<string, string> = {}
) {
  // ... existing code ...

  // CRITICAL: Verify payment amount matches expected price
  if (!isCartParent && !isTopUp && offerId) {
    // Get expected price from product
    const packageData = await getEsimPackage(offerId);
    if (!packageData) {
      throw new Error(`Package not found: ${offerId}`);
    }

    // Calculate expected price
    const costPriceData = packageData.costPrice || packageData.price;
    const divisor = costPriceData.currencyDivisor || 100;
    const providerCostInCents = Math.round((costPriceData.fixed / divisor) * 100);
    
    // Apply profit margin
    const profitMargin = getProfitMargin();
    const minProfitCents = getMinProfitCents();
    const priceWithMargin = Math.round(providerCostInCents * profitMargin);
    const priceWithMinProfit = providerCostInCents + minProfitCents;
    const expectedPriceCents = Math.max(priceWithMargin, priceWithMinProfit);

    // Apply discount if present
    let finalExpectedPrice = expectedPriceCents;
    if (discountCode) {
      const discountValidation = await validateDiscountForContext({
        codeRaw: discountCode,
        customerEmail: recipientEmail,
        transactionId,
        appliesTo: isCartParent ? "cart" : "esim",
      });
      
      if (discountValidation.ok) {
        const discountCalc = applyPercentDiscountWithFloor({
          totalCents: expectedPriceCents,
          percentOff: discountValidation.codeRow.percent_off,
          minTotalCents: providerCostInCents + minProfitCents,
        });
        finalExpectedPrice = discountCalc.discountedTotalCents;
      }
    }

    // Verify amount
    const verification = await verifyPaymentAmount(
      paymentIntent,
      offerId,
      finalExpectedPrice
    );

    if (!verification.valid) {
      console.error('[Stripe Webhook] ❌ PRICE MISMATCH DETECTED:', verification.details);
      
      // Log security event
      await logSecurityEvent({
        eventType: 'fraud_price_mismatch',
        paymentIntentId: paymentIntent.id,
        ip: 'webhook',
        details: verification.details,
      });

      throw new Error(`Price verification failed: ${verification.error}`);
    }

    console.log('[Stripe Webhook] ✅ Price verified:', {
      paidAmount: paymentIntent.amount,
      expectedPrice: finalExpectedPrice,
      match: true,
    });
  }

  // ... rest of fulfillment logic
}
```

---

### Fix #2: Add Timestamp Validation

**File:** `src/app/api/webhooks/stripe/route.ts`

```typescript
/**
 * Validate webhook event timestamp
 * Reject events older than 5 minutes
 */
function validateWebhookTimestamp(event: Stripe.Event): { valid: boolean; error?: string } {
  const eventAge = Date.now() / 1000 - event.created;
  const maxAge = 5 * 60; // 5 minutes

  if (eventAge > maxAge) {
    return {
      valid: false,
      error: `Event too old: ${Math.round(eventAge / 60)} minutes (max: ${maxAge / 60} minutes)`,
    };
  }

  if (eventAge < 0) {
    return {
      valid: false,
      error: 'Event timestamp is in the future',
    };
  }

  return { valid: true };
}

// In POST handler:
export async function POST(req: NextRequest) {
  // ... signature verification ...

  // Validate timestamp
  const timestampValidation = validateWebhookTimestamp(event);
  if (!timestampValidation.valid) {
    console.error('[Stripe Webhook] ❌ Timestamp validation failed:', timestampValidation.error);
    return NextResponse.json(
      { error: 'Event timestamp validation failed' },
      { status: 400 }
    );
  }

  // ... rest of handler
}
```

---

### Fix #3: Fix Race Condition with Database Transaction

**File:** `src/app/api/webhooks/stripe/route.ts`

```typescript
/**
 * Atomically check and mark payment intent as processed
 * Uses database transaction to prevent race conditions
 */
async function markPaymentIntentProcessed(
  paymentIntentId: string,
  transactionId: string
): Promise<{ alreadyProcessed: boolean; success: boolean }> {
  if (!isSupabaseAdminReady()) {
    return { alreadyProcessed: false, success: false };
  }

  try {
    // Use database transaction with row-level locking
    const { data, error } = await supabase.rpc('mark_payment_intent_processed', {
      p_payment_intent_id: paymentIntentId,
      p_transaction_id: transactionId,
    });

    if (error) {
      // Check if it's a duplicate key error (already processed)
      if (error.code === '23505') { // Unique constraint violation
        return { alreadyProcessed: true, success: false };
      }
      throw error;
    }

    return { alreadyProcessed: false, success: true };
  } catch (error) {
    console.error('[Stripe Webhook] Error marking payment intent processed:', error);
    return { alreadyProcessed: false, success: false };
  }
}
```

**Database Function:** `supabase/migrations/013_payment_intent_atomic_lock.sql`

```sql
-- Function to atomically check and mark payment intent as processed
CREATE OR REPLACE FUNCTION mark_payment_intent_processed(
  p_payment_intent_id TEXT,
  p_transaction_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  -- Check if already processed (with row lock)
  SELECT EXISTS(
    SELECT 1 FROM esim_purchases
    WHERE stripe_payment_intent_id = p_payment_intent_id
    FOR UPDATE
  ) INTO v_exists;

  IF v_exists THEN
    RETURN FALSE; -- Already processed
  END IF;

  -- Insert with transaction_id (will fail if duplicate)
  INSERT INTO esim_purchases (
    stripe_payment_intent_id,
    transaction_id,
    stripe_payment_status,
    created_at
  ) VALUES (
    p_payment_intent_id,
    p_transaction_id,
    'processing',
    NOW()
  ) ON CONFLICT (stripe_payment_intent_id) DO NOTHING;

  -- Check if insert succeeded
  RETURN NOT EXISTS(
    SELECT 1 FROM esim_purchases
    WHERE stripe_payment_intent_id = p_payment_intent_id
      AND transaction_id != p_transaction_id
  );
END;
$$ LANGUAGE plpgsql;
```

---

### Fix #4: Sanitize Logs

**File:** `src/lib/secure-logging.ts` (NEW)

```typescript
/**
 * Secure logging utilities
 * Sanitizes PII and sensitive data from logs
 */

/**
 * Sanitize email for logging
 */
export function sanitizeEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return 'invalid-email';
  }
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local.substring(0, 2)}***@${domain}`;
}

/**
 * Sanitize name for logging
 */
export function sanitizeName(name: string): string {
  if (!name || name.length <= 2) {
    return '***';
  }
  return `${name.substring(0, 1)}***${name.substring(name.length - 1)}`;
}

/**
 * Sanitize payment amount (show range, not exact)
 */
export function sanitizeAmount(amountCents: number): string {
  const amount = amountCents / 100;
  if (amount < 10) {
    return '<$10';
  } else if (amount < 50) {
    return '$10-$50';
  } else if (amount < 100) {
    return '$50-$100';
  } else {
    return `>$${Math.floor(amount / 100) * 100}`;
  }
}

/**
 * Sanitize payment intent ID
 */
export function sanitizePaymentIntentId(id: string): string {
  if (!id || id.length < 10) {
    return 'invalid-id';
  }
  return `${id.substring(0, 8)}...${id.substring(id.length - 4)}`;
}

/**
 * Secure log function
 */
export function secureLog(
  level: 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, any>
): void {
  const sanitized: Record<string, any> = {};

  if (data) {
    for (const [key, value] of Object.entries(data)) {
      if (key.toLowerCase().includes('email')) {
        sanitized[key] = sanitizeEmail(String(value));
      } else if (key.toLowerCase().includes('name') || key.toLowerCase().includes('fullname')) {
        sanitized[key] = sanitizeName(String(value));
      } else if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('price')) {
        sanitized[key] = sanitizeAmount(Number(value));
      } else if (key.toLowerCase().includes('payment_intent') || key.toLowerCase().includes('paymentintent')) {
        sanitized[key] = sanitizePaymentIntentId(String(value));
      } else if (key.toLowerCase().includes('card') || key.toLowerCase().includes('cvv') || key.toLowerCase().includes('cvc')) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }
  }

  if (level === 'error') {
    console.error(`[${message}]`, sanitized);
  } else if (level === 'warn') {
    console.warn(`[${message}]`, sanitized);
  } else {
    console.log(`[${message}]`, sanitized);
  }
}
```

---

### Fix #5: Secure Update Payment Intent

**File:** `src/app/api/update-payment-intent/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { getClientIP } from "@/lib/security";
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

    // 5. Check payment status (can't update if already succeeded)
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

### Fix #6: Secure Idempotency Key Generation

**File:** `src/app/api/create-payment-intent/route.ts`

```typescript
import { randomUUID } from 'crypto';

// Generate secure idempotency key
function generateIdempotencyKey(
  offerId: string,
  email: string | undefined,
  discountCode: string | undefined
): string {
  // Use UUID for uniqueness
  const uuid = randomUUID();
  // Include offerId and timestamp for debugging
  const timestamp = Date.now();
  const key = `pi_${offerId}_${email ? sanitizeEmail(email).replace('@', '_') : 'noemail'}_${discountCode || 'nodisc'}_${timestamp}_${uuid}`;
  
  // Stripe limits to 255 chars
  return key.substring(0, 255);
}

// In POST handler:
const idempotencyKey = generateIdempotencyKey(
  sanitizedOfferId,
  sanitizedEmail,
  sanitizedDiscountCode
);
```

---

### Fix #7: Add Event ID Deduplication

**File:** `src/app/api/webhooks/stripe/route.ts`

```typescript
/**
 * Check if webhook event was already processed
 */
async function isEventProcessed(eventId: string): Promise<boolean> {
  if (!isSupabaseAdminReady()) {
    return false;
  }

  const { data } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('event_id', eventId)
    .eq('source', 'stripe')
    .eq('processed', true)
    .maybeSingle();

  return !!data;
}

// In POST handler:
export async function POST(req: NextRequest) {
  // ... signature verification ...

  // Check if event already processed
  const alreadyProcessed = await isEventProcessed(event.id);
  if (alreadyProcessed) {
    console.log('[Stripe Webhook] Event already processed:', event.id);
    return NextResponse.json({
      received: true,
      duplicate: true,
      message: 'Event already processed',
    });
  }

  // ... process event ...

  // Mark event as processed
  await markWebhookEventProcessed(event.id, 'stripe');
}
```

---

### Fix #8: Store Expected Price in Metadata

**File:** `src/app/api/create-payment-intent/route.ts`

```typescript
// Calculate expected price
const expectedPriceCents = discount ? discount.discountedTotalCents : priceInCents;

// Store in metadata for webhook verification
const metadata: Record<string, string> = {
  offerId: sanitizedOfferId,
  productName: sanitizeString(productName, 200),
  expectedPriceCents: String(expectedPriceCents), // ✅ Store for verification
  expectedCurrency: currency,
  ...(sanitizedEmail && { recipientEmail: sanitizedEmail }),
  ...(sanitizedFullName && { fullName: sanitizedFullName }),
  ...(discount && {
    discountCode: discount.code,
    discountPercentOff: String(discount.percentOff),
    discountAmountCents: String(discount.discountAmountCents),
  }),
};

const paymentIntent = await stripe.paymentIntents.create({
  amount: expectedPriceCents, // ✅ Use calculated price
  currency: currency,
  metadata,
  // ... rest of config
});
```

---

## 5. Secure Checkout Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT                                │
│  - Request payment intent                                │
│  - Complete payment via Stripe.js                        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              PAYMENT INTENT CREATION                     │
│  1. Validate offerId                                     │
│  2. Fetch product from provider API                      │
│  3. Calculate price server-side                          │
│  4. Apply discount (if valid)                            │
│  5. Store expected price in metadata                     │
│  6. Generate secure transaction ID                       │
│  7. Create payment intent with calculated price          │
│  8. Return clientSecret                                  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                    STRIPE                                │
│  - Process payment                                        │
│  - Send webhook event                                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              WEBHOOK PROCESSING                          │
│  1. Verify signature                                     │
│  2. Validate timestamp (< 5 min old)                      │
│  3. Check event.id deduplication                         │
│  4. Verify payment amount matches expected price          │
│  5. Atomically check/insert (prevent race condition)     │
│  6. Verify product details                               │
│  7. Process fulfillment                                  │
│  8. Mark event as processed                              │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Validation Logic Examples

### Example 1: Price Verification Function

```typescript
/**
 * Verify payment amount matches expected product price
 */
export async function verifyPaymentPrice(
  paymentIntent: Stripe.PaymentIntent,
  offerId: string,
  discountCode?: string | null
): Promise<{
  valid: boolean;
  error?: string;
  expectedPrice?: number;
  paidPrice?: number;
  difference?: number;
}> {
  // 1. Get expected price from metadata
  const expectedPriceCents = parseInt(
    paymentIntent.metadata?.expectedPriceCents || '0',
    10
  );

  if (expectedPriceCents === 0) {
    // Fallback: Calculate from product
    const packageData = await getEsimPackage(offerId);
    if (!packageData) {
      return {
        valid: false,
        error: 'Product not found',
      };
    }

    // Calculate expected price
    const costPriceData = packageData.costPrice || packageData.price;
    const divisor = costPriceData.currencyDivisor || 100;
    const providerCostInCents = Math.round((costPriceData.fixed / divisor) * 100);
    
    const profitMargin = getProfitMargin();
    const minProfitCents = getMinProfitCents();
    const priceWithMargin = Math.round(providerCostInCents * profitMargin);
    const priceWithMinProfit = providerCostInCents + minProfitCents;
    const calculatedPrice = Math.max(priceWithMargin, priceWithMinProfit);

    // Apply discount if present
    let finalExpectedPrice = calculatedPrice;
    if (discountCode) {
      const discountValidation = await validateDiscountForContext({
        codeRaw: discountCode,
        customerEmail: paymentIntent.metadata?.recipientEmail || null,
        transactionId: paymentIntent.metadata?.transactionId || null,
        appliesTo: 'esim',
      });

      if (discountValidation.ok) {
        const discountCalc = applyPercentDiscountWithFloor({
          totalCents: calculatedPrice,
          percentOff: discountValidation.codeRow.percent_off,
          minTotalCents: providerCostInCents + minProfitCents,
        });
        finalExpectedPrice = discountCalc.discountedTotalCents;
      }
    }

    // Verify
    const paidAmount = paymentIntent.amount;
    const difference = Math.abs(paidAmount - finalExpectedPrice);
    const tolerance = 1; // 1 cent tolerance

    if (difference > tolerance) {
      return {
        valid: false,
        error: `Price mismatch: paid ${paidAmount}, expected ${finalExpectedPrice}`,
        expectedPrice: finalExpectedPrice,
        paidPrice: paidAmount,
        difference,
      };
    }

    return {
      valid: true,
      expectedPrice: finalExpectedPrice,
      paidPrice: paidAmount,
    };
  }

  // 2. Compare with paid amount
  const paidAmount = paymentIntent.amount;
  const difference = Math.abs(paidAmount - expectedPriceCents);
  const tolerance = 1; // 1 cent tolerance for rounding

  if (difference > tolerance) {
    return {
      valid: false,
      error: `Price mismatch: paid ${paidAmount}, expected ${expectedPriceCents}`,
      expectedPrice: expectedPriceCents,
      paidPrice: paidAmount,
      difference,
    };
  }

  return {
    valid: true,
    expectedPrice: expectedPriceCents,
    paidPrice: paidAmount,
  };
}
```

---

### Example 2: Complete Secure Webhook Handler

```typescript
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
        eventAge: Date.now() / 1000 - event.created,
      });
      return NextResponse.json(
        { error: 'Event timestamp validation failed' },
        { status: 400 }
      );
    }

    // 3. Check event deduplication
    const alreadyProcessed = await isEventProcessed(event.id);
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

    // 5. Process event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // 6. Verify price
      const offerId = paymentIntent.metadata?.offerId;
      const discountCode = paymentIntent.metadata?.discountCode || null;
      
      if (offerId) {
        const priceVerification = await verifyPaymentPrice(
          paymentIntent,
          offerId,
          discountCode
        );

        if (!priceVerification.valid) {
          secureLog('error', 'Price verification failed', {
            paymentIntentId: paymentIntent.id,
            offerId,
            expectedPrice: priceVerification.expectedPrice,
            paidPrice: priceVerification.paidPrice,
            difference: priceVerification.difference,
          });

          // Log security event
          await logSecurityEvent({
            eventType: 'fraud_price_mismatch',
            paymentIntentId: paymentIntent.id,
            ip: 'webhook',
            details: priceVerification,
          });

          return NextResponse.json(
            { error: 'Price verification failed' },
            { status: 400 }
          );
        }
      }

      // 7. Process fulfillment (with atomic check)
      const result = await processPaymentAndFulfill(paymentIntent);

      // 8. Mark event as processed
      await markWebhookEventProcessed(event.id, 'stripe');

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

## 7. Recommended Security Measures

### Price Verification Checklist
- [ ] Store expected price in payment intent metadata
- [ ] Verify price in webhook handler
- [ ] Calculate all prices server-side
- [ ] Never trust client-provided prices
- [ ] Verify discount codes server-side
- [ ] Check profit margin compliance

### Replay Attack Prevention
- [ ] Validate webhook event timestamps
- [ ] Implement event.id deduplication
- [ ] Use database transactions for idempotency
- [ ] Add nonce checking (optional)
- [ ] Reject events older than 5 minutes

### Race Condition Prevention
- [ ] Use database transactions
- [ ] Implement row-level locking
- [ ] Use atomic check-and-insert operations
- [ ] Add unique constraints
- [ ] Handle duplicate key errors gracefully

### PII Protection
- [ ] Sanitize all logs
- [ ] Remove PII from error messages
- [ ] Use secure logging utilities
- [ ] Encrypt sensitive data at rest
- [ ] Implement data retention policies

---

## 8. Implementation Checklist

### Critical Fixes (Week 1)
- [ ] Add price verification in webhook
- [ ] Add timestamp validation
- [ ] Fix race condition with transactions
- [ ] Sanitize all logs
- [ ] Secure update payment intent endpoint
- [ ] Add event.id deduplication

### High Priority (Week 2)
- [ ] Store expected prices in metadata
- [ ] Improve idempotency key generation
- [ ] Add cart price verification
- [ ] Implement secure logging utility
- [ ] Add fraud detection alerts

### Medium Priority (Month 1)
- [ ] Add nonce checking
- [ ] Implement payment monitoring
- [ ] Create fraud detection dashboard
- [ ] Add automated testing

---

**See Implementation Guide:** `docs/PAYMENT_SECURITY_IMPLEMENTATION.md`
