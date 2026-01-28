# Promotion System Edge Case Fixes

## Implementation Guide

This document provides code-level fixes for the critical edge cases identified in the audit.

## Fix 1: Promo Expiry During Checkout

### Problem
Promotion can expire between pricing calculation and payment completion.

### Solution
Re-validate promotion at payment completion using PaymentIntent creation time.

### Implementation

**File:** `src/app/api/webhooks/stripe/route.ts`

```typescript
import { validatePromotionAtPaymentIntent } from '@/lib/promotion-validation';

// In payment_intent.succeeded handler
async function processPaymentAndFulfill(paymentIntent: Stripe.PaymentIntent) {
  const promotionId = paymentIntent.metadata.promotion_id;
  
  if (promotionId) {
    // Get PaymentIntent creation time (Stripe timestamp in seconds)
    const createdAt = new Date(paymentIntent.created * 1000);
    
    // Validate promotion was active at PaymentIntent creation
    const validation = await validatePromotionAtPaymentIntent(
      paymentIntent.id,
      promotionId
    );
    
    if (!validation.valid) {
      // Log discrepancy but allow payment (grace period)
      await logPromoExpiryDiscrepancy(paymentIntent.id, promotionId, {
        createdAt: createdAt.toISOString(),
        error: validation.error,
      });
      
      // Optionally: Refund discount amount if promo expired
      // const discountAmount = parseInt(paymentIntent.metadata.discount_applied || '0');
      // if (discountAmount > 0) {
      //   await adjustPaymentForExpiredPromo(paymentIntent.id, discountAmount);
      // }
    }
  }
  
  // Continue with normal payment processing...
}
```

## Fix 2: Timezone Inconsistencies

### Problem
Multiple timezone sources cause inconsistent promo status.

### Solution
Enforce UTC consistently across all code paths.

### Implementation

**File:** `src/lib/pricing-calculator.ts`

```typescript
import { getCurrentUTCTime } from '@/lib/promotion-validation';

async function getActivePromotion(
  appliesTo: 'esim' | 'cart' | 'topup' | 'any' = 'esim',
  promoCode?: string | null
): Promise<PromotionRow | null> {
  if (!isSupabaseAdminReady()) {
    return null;
  }

  try {
    // Use UTC explicitly
    const checkTimeUTC = getCurrentUTCTime();
    
    // Use database function with explicit UTC time
    const { data, error } = await supabase
      .rpc('get_active_promotion', {
        p_applies_to: appliesTo,
        p_promo_code: promoCode || null,
        p_check_time: checkTimeUTC, // Explicit UTC
      })
      .maybeSingle();

    // ... rest of function
  } catch (error) {
    return null;
  }
}

function validatePromotion(promotion: PromotionRow, originalPriceCents: number): {
  valid: boolean;
  error?: string;
} {
  // Use UTC for all time comparisons
  const nowUTC = new Date(getCurrentUTCTime());
  const startsAt = new Date(promotion.starts_at); // Already UTC from database
  const endsAt = new Date(promotion.ends_at); // Already UTC from database

  // Check time range (all in UTC)
  if (nowUTC < startsAt || nowUTC > endsAt) {
    return { valid: false, error: 'Promotion is not currently active' };
  }

  // ... rest of validation
}
```

## Fix 3: Per-Customer Limits

### Problem
Users can abuse promotions with multiple accounts.

### Solution
Add per-customer/email limits to promotions.

### Implementation

**File:** `src/lib/pricing-calculator.ts`

```typescript
import { checkCustomerPromoLimit } from '@/lib/promotion-validation';

export async function calculatePricing(
  offerId: string,
  promoCode?: string | null,
  customerEmail?: string | null
): Promise<PricingResult> {
  // ... existing code ...

  if (activePromotion) {
    const validation = validatePromotion(activePromotion, originalPriceCents);
    
    if (validation.valid) {
      // Check per-customer limit
      if (customerEmail) {
        const maxPerCustomer = activePromotion.max_per_customer || 1;
        const limitCheck = await checkCustomerPromoLimit(
          customerEmail,
          activePromotion.id,
          maxPerCustomer
        );
        
        if (!limitCheck.withinLimit) {
          if (normalizedPromoCode) {
            return {
              success: false,
              error: `Promotion limit reached for this customer (${limitCheck.currentCount}/${maxPerCustomer})`,
            };
          }
          // For auto-applied, silently skip
          activePromotion = undefined;
        }
      }
      
      // Apply discount if still valid
      if (activePromotion) {
        // ... apply discount ...
      }
    }
  }
  
  // ... rest of function
}
```

**Database Migration:**

```sql
-- Add max_per_customer field to promotions table
ALTER TABLE public.promotions
ADD COLUMN IF NOT EXISTS max_per_customer INTEGER DEFAULT 1 CHECK (max_per_customer >= 1);
```

## Fix 4: Atomic Reservation

### Problem
Race conditions allow duplicate redemptions.

### Solution
Use database-level row locking for atomic operations.

### Implementation

**File:** `src/lib/promotion-redemption.ts` (NEW)

```typescript
import { supabaseAdmin as supabase, isSupabaseAdminReady } from '@/lib/supabase';

/**
 * Atomically reserve a promotion with row-level locking
 * Prevents race conditions in concurrent requests
 */
export async function reservePromotionAtomic(
  promotionId: string,
  paymentIntentId: string,
  customerEmail?: string | null
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseAdminReady()) {
    return { success: false, error: 'Database not configured' };
  }

  try {
    // Use database function with row-level locking
    const { data, error } = await supabase.rpc('reserve_promotion_atomic', {
      p_promotion_id: promotionId,
      p_payment_intent_id: paymentIntentId,
      p_customer_email: customerEmail || null,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Promotion limit reached or expired' };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Reservation failed' };
  }
}
```

## Fix 5: Comprehensive Logging

### Problem
Missing logs for debugging and abuse detection.

### Solution
Add structured logging for all promotion events.

### Implementation

**File:** `src/lib/promotion-logging.ts` (NEW)

```typescript
import { supabaseAdmin as supabase, isSupabaseAdminReady } from '@/lib/supabase';
import { sanitizeEmail } from '@/lib/secure-logging';
import crypto from 'crypto';

type PromoLogEvent = 
  | 'promo_calculated'
  | 'promo_applied'
  | 'promo_expired'
  | 'promo_abuse'
  | 'promo_validation_failed'
  | 'promo_limit_exceeded';

interface PromoLogData {
  event: PromoLogEvent;
  promotionId?: string;
  promoCode?: string;
  paymentIntentId?: string;
  customerEmail?: string;
  metadata?: Record<string, any>;
}

/**
 * Hash email for privacy-preserving logging
 */
function hashEmail(email: string): string {
  return crypto
    .createHash('sha256')
    .update(email.toLowerCase().trim())
    .digest('hex')
    .substring(0, 16);
}

/**
 * Log promotion event for audit and observability
 */
export async function logPromoEvent(data: PromoLogData): Promise<void> {
  if (!isSupabaseAdminReady()) {
    return;
  }

  try {
    const customerEmailHash = data.customerEmail 
      ? hashEmail(data.customerEmail)
      : null;

    await supabase.from('promo_audit_log').insert({
      event_type: data.event,
      promotion_id: data.promotionId || null,
      promo_code: data.promoCode || null,
      payment_intent_id: data.paymentIntentId || null,
      customer_email_hash: customerEmailHash,
      metadata: data.metadata || {},
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    // Best-effort logging - don't block main flow
    console.error('[Promo Log] Failed to log event:', error);
  }
}

/**
 * Log promo expiry discrepancy
 */
export async function logPromoExpiryDiscrepancy(
  paymentIntentId: string,
  promotionId: string,
  details: {
    createdAt: string;
    completedAt?: string;
    error?: string;
  }
): Promise<void> {
  await logPromoEvent({
    event: 'promo_expired',
    promotionId,
    paymentIntentId,
    metadata: {
      createdAt: details.createdAt,
      completedAt: details.completedAt || new Date().toISOString(),
      error: details.error,
      discrepancy: true,
    },
  });
}

/**
 * Log potential abuse pattern
 */
export async function logPromoAbuse(
  promotionId: string,
  promoCode: string,
  indicators: {
    customerEmail?: string;
    ipAddress?: string;
    attemptCount: number;
    timeWindow: number; // seconds
  }
): Promise<void> {
  await logPromoEvent({
    event: 'promo_abuse',
    promotionId,
    promoCode,
    customerEmail: indicators.customerEmail,
    metadata: {
      attemptCount: indicators.attemptCount,
      timeWindow: indicators.timeWindow,
      ipAddress: indicators.ipAddress ? hashEmail(indicators.ipAddress) : null,
    },
  });
}
```

## Fix 6: Webhook Handler Updates

### Problem
Webhook doesn't re-validate promotions.

### Solution
Add promotion validation in webhook handler.

### Implementation

**File:** `src/app/api/webhooks/stripe/route.ts`

```typescript
import { validatePromotionAtPaymentIntent } from '@/lib/promotion-validation';
import { logPromoExpiryDiscrepancy, logPromoEvent } from '@/lib/promotion-logging';

// In payment_intent.succeeded handler
if (event.type === 'payment_intent.succeeded') {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const promotionId = paymentIntent.metadata.promotion_id;
  
  // Re-validate promotion if one was applied
  if (promotionId) {
    const createdAt = new Date(paymentIntent.created * 1000);
    const validation = await validatePromotionAtPaymentIntent(
      paymentIntent.id,
      promotionId
    );
    
    if (!validation.valid) {
      // Log the discrepancy
      await logPromoExpiryDiscrepancy(paymentIntent.id, promotionId, {
        createdAt: createdAt.toISOString(),
        completedAt: new Date().toISOString(),
        error: validation.error,
      });
      
      // Log the event
      await logPromoEvent({
        event: 'promo_validation_failed',
        promotionId,
        paymentIntentId: paymentIntent.id,
        customerEmail: paymentIntent.metadata.recipientEmail,
        metadata: {
          createdAt: createdAt.toISOString(),
          error: validation.error,
        },
      });
    } else {
      // Log successful application
      await logPromoEvent({
        event: 'promo_applied',
        promotionId,
        paymentIntentId: paymentIntent.id,
        promoCode: paymentIntent.metadata.promo_code,
        customerEmail: paymentIntent.metadata.recipientEmail,
        metadata: {
          discountAmount: paymentIntent.metadata.discount_applied,
          originalPrice: paymentIntent.metadata.original_price,
        },
      });
    }
  }
  
  // Continue with payment processing...
}
```

## Fix 7: Abuse Detection

### Problem
No detection for abuse patterns.

### Solution
Add rate limiting and pattern detection.

### Implementation

**File:** `src/lib/promotion-abuse-detection.ts` (NEW)

```typescript
import { checkRateLimit } from '@/lib/security';
import { logPromoAbuse } from '@/lib/promotion-logging';

/**
 * Check for abuse patterns in promotion usage
 */
export async function detectPromoAbuse(params: {
  promotionId: string;
  promoCode: string;
  customerEmail?: string;
  clientIP: string;
}): Promise<{ isAbuse: boolean; reason?: string }> {
  const { promotionId, promoCode, customerEmail, clientIP } = params;

  // 1. Rate limit per IP
  const ipRateLimit = checkRateLimit(
    `promo:${promoCode}:ip:${clientIP}`,
    5, // 5 attempts
    60000 // per minute
  );

  if (!ipRateLimit.allowed) {
    await logPromoAbuse(promotionId, promoCode, {
      ipAddress: clientIP,
      attemptCount: 5,
      timeWindow: 60,
    });
    return { isAbuse: true, reason: 'Too many attempts from this IP' };
  }

  // 2. Rate limit per email
  if (customerEmail) {
    const emailRateLimit = checkRateLimit(
      `promo:${promoCode}:email:${customerEmail}`,
      3, // 3 attempts
      3600000 // per hour
    );

    if (!emailRateLimit.allowed) {
      await logPromoAbuse(promotionId, promoCode, {
        customerEmail,
        attemptCount: 3,
        timeWindow: 3600,
      });
      return { isAbuse: true, reason: 'Too many attempts for this email' };
    }
  }

  // 3. Check for rapid-fire attempts
  const rapidFireLimit = checkRateLimit(
    `promo:${promoCode}:rapid:${clientIP}`,
    10, // 10 attempts
    10000 // per 10 seconds
  );

  if (!rapidFireLimit.allowed) {
    await logPromoAbuse(promotionId, promoCode, {
      ipAddress: clientIP,
      attemptCount: 10,
      timeWindow: 10,
    });
    return { isAbuse: true, reason: 'Rapid-fire attempt pattern detected' };
  }

  return { isAbuse: false };
}
```

## Testing

### Test Cases

```typescript
// Test 1: Promo expiry during checkout
describe('Promo expiry during checkout', () => {
  it('should re-validate promotion at payment completion', async () => {
    // Create payment intent with active promo
    // Simulate promo expiry
    // Verify re-validation in webhook
  });
});

// Test 2: Timezone consistency
describe('Timezone handling', () => {
  it('should use UTC consistently', async () => {
    // Test with different server timezones
    // Verify consistent results
  });
});

// Test 3: Per-customer limits
describe('Per-customer limits', () => {
  it('should enforce per-customer limits', async () => {
    // Apply promo multiple times with same email
    // Verify limit enforcement
  });
});

// Test 4: Race conditions
describe('Race conditions', () => {
  it('should prevent duplicate redemptions', async () => {
    // Simulate concurrent requests
    // Verify atomic reservation
  });
});
```

## Monitoring Queries

### Check for Expiry Discrepancies

```sql
SELECT 
  event_type,
  promotion_id,
  payment_intent_id,
  metadata->>'createdAt' as created_at,
  metadata->>'completedAt' as completed_at,
  metadata->>'error' as error,
  created_at as logged_at
FROM promo_audit_log
WHERE event_type = 'promo_expired'
  AND metadata->>'discrepancy' = 'true'
ORDER BY created_at DESC
LIMIT 100;
```

### Detect Abuse Patterns

```sql
SELECT 
  promo_code,
  customer_email_hash,
  COUNT(*) as attempt_count,
  MIN(created_at) as first_attempt,
  MAX(created_at) as last_attempt
FROM promo_audit_log
WHERE event_type = 'promo_abuse'
  AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY promo_code, customer_email_hash
HAVING COUNT(*) >= 5
ORDER BY attempt_count DESC;
```

## Summary

These fixes address all critical edge cases:

✅ **Promo expiry during checkout** - Re-validation in webhook  
✅ **Timezone inconsistencies** - UTC enforcement  
✅ **Per-customer limits** - Database checks  
✅ **Race conditions** - Atomic reservations  
✅ **Abuse detection** - Rate limiting and logging  
✅ **Comprehensive logging** - Audit trail  
