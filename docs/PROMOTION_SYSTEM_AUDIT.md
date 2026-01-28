# Promotion System Edge Case Audit

## Executive Summary

This audit identifies edge cases, vulnerabilities, and recommendations for the promotional pricing system. Critical issues found include timezone handling, promo expiry during checkout, and abuse prevention gaps.

## Critical Findings

### 🔴 CRITICAL: Promo Expiry During Checkout

**Issue:** Promotion can expire between pricing calculation and payment completion.

**Current Behavior:**
- Pricing calculated at PaymentIntent creation
- Promotion status not re-validated at payment completion
- User may complete payment with expired promo

**Risk:** Users get discounts for expired promotions.

**Recommendation:**
```typescript
// In webhook handler, re-validate promotion before redemption
const promoStillActive = await validatePromotionAtTime(
  promotionId,
  paymentIntent.created // Use PaymentIntent creation time
);
```

### 🔴 CRITICAL: Timezone Inconsistencies

**Issue:** Multiple timezone sources can cause inconsistent promo status.

**Current Behavior:**
- Database uses `TIMESTAMPTZ` (UTC)
- Server uses `new Date()` (server timezone)
- Client may use local timezone
- No explicit UTC enforcement

**Risk:** Promotions may appear active/inactive incorrectly based on timezone.

**Recommendation:**
```typescript
// Always use UTC explicitly
const now = new Date().toISOString(); // UTC
const checkTime = new Date(promo.ends_at).toISOString(); // UTC

// In database functions, use NOW() which returns UTC in Postgres
```

### 🟡 HIGH: Orders Started Before Promo Window

**Issue:** User starts checkout before promo starts, completes after.

**Current Behavior:**
- Pricing calculated at PaymentIntent creation
- If promo not active at creation, no discount applied
- No mechanism to apply retroactive discounts

**Risk:** Users miss discounts if they start checkout early.

**Recommendation:**
- Re-check promotion status at payment completion
- Apply discount if promo becomes active during checkout
- Log timing discrepancies for analysis

### 🟡 HIGH: Duplicate Discount Prevention Gaps

**Issue:** Multiple ways to bypass duplicate prevention.

**Current Behavior:**
- `promotion_redemptions` has unique constraint on `payment_intent_id`
- Virtual promo codes (Ramadan) skip reservation
- No per-customer or per-email limits for promotions

**Risk:** Users can abuse promotions with multiple accounts.

**Recommendation:**
```sql
-- Add per-customer limit check
CREATE INDEX idx_promotion_redemptions_email_promo 
  ON promotion_redemptions(customer_email, promotion_id);

-- Add function to check customer redemption count
CREATE FUNCTION check_customer_promo_limit(
  p_customer_email TEXT,
  p_promotion_id UUID,
  p_max_per_customer INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
  SELECT COUNT(*) < p_max_per_customer
  FROM promotion_redemptions
  WHERE customer_email = p_customer_email
    AND promotion_id = p_promotion_id;
$$ LANGUAGE sql;
```

## Edge Cases Identified

### 1. Promo Expiry During Checkout

**Scenario:**
1. User calculates pricing at 11:59 PM (promo active)
2. User fills out form (takes 2 minutes)
3. User completes payment at 12:01 AM (promo expired)
4. PaymentIntent created with discount

**Current Handling:**
- ❌ No re-validation at payment completion
- ❌ Discount applied even if promo expired

**Fix Required:**
```typescript
// In webhook handler (payment_intent.succeeded)
async function validatePromotionAtPayment(paymentIntent: Stripe.PaymentIntent) {
  const promoId = paymentIntent.metadata.promotion_id;
  if (!promoId) return true; // No promo applied
  
  // Check if promo was active at PaymentIntent creation time
  const createdAt = new Date(paymentIntent.created * 1000);
  const promo = await getPromotionAtTime(promoId, createdAt);
  
  if (!promo || !promo.active) {
    // Log discrepancy but allow payment (grace period)
    await logPromoExpiryDiscrepancy(paymentIntent.id, promoId);
    return false;
  }
  
  return true;
}
```

### 2. Timezone Inconsistencies

**Scenario:**
- Server in UTC
- Database in UTC
- Client in EST (UTC-5)
- Promo ends at 11:59 PM UTC (6:59 PM EST)

**Current Handling:**
- ✅ Database uses `TIMESTAMPTZ` (UTC)
- ⚠️ Server uses `new Date()` (may vary)
- ❌ No explicit UTC enforcement in all code paths

**Fix Required:**
```typescript
// Always use UTC explicitly
function getCurrentUTCTime(): string {
  return new Date().toISOString(); // Always UTC
}

// In validation
const now = getCurrentUTCTime();
const promoStart = new Date(promo.starts_at).toISOString();
const promoEnd = new Date(promo.ends_at).toISOString();

// Use database NOW() for consistency
const { data } = await supabase.rpc('get_active_promotion', {
  p_check_time: 'NOW()' // Let database handle time
});
```

### 3. Orders Started Before Promo Window

**Scenario:**
1. User starts checkout at 11:58 PM (promo starts at 12:00 AM)
2. User completes payment at 12:01 AM (promo now active)
3. No discount applied

**Current Handling:**
- ❌ Pricing calculated only at PaymentIntent creation
- ❌ No retroactive discount application

**Fix Required:**
```typescript
// Re-check promotion at payment completion
async function applyRetroactiveDiscount(paymentIntent: Stripe.PaymentIntent) {
  const createdAt = new Date(paymentIntent.created * 1000);
  const completedAt = new Date();
  
  // Check if promo became active during checkout
  const promoAtCreation = await getActivePromotionAtTime(createdAt);
  const promoAtCompletion = await getActivePromotionAtTime(completedAt);
  
  if (!promoAtCreation && promoAtCompletion) {
    // Promo became active - apply discount retroactively
    await applyDiscountToPaymentIntent(paymentIntent.id, promoAtCompletion);
  }
}
```

### 4. Duplicate Discount Prevention

**Scenario:**
- User creates multiple accounts
- Uses same promo code on each
- Bypasses per-email limits

**Current Handling:**
- ✅ Unique constraint on `payment_intent_id`
- ❌ No per-customer/email limits for promotions
- ❌ Virtual promo codes (Ramadan) have no limits

**Fix Required:**
```typescript
// Add per-customer limit check
async function checkCustomerPromoLimit(
  customerEmail: string,
  promotionId: string,
  maxPerCustomer: number = 1
): Promise<boolean> {
  const { count } = await supabase
    .from('promotion_redemptions')
    .select('*', { count: 'exact', head: true })
    .eq('customer_email', customerEmail)
    .eq('promotion_id', promotionId);
  
  return (count || 0) < maxPerCustomer;
}
```

### 5. Race Conditions

**Scenario:**
- Two users apply same promo code simultaneously
- Both pass validation
- Both create PaymentIntents
- Both redeem discount

**Current Handling:**
- ✅ Reservation system prevents double-spend
- ⚠️ Race condition possible between check and reservation
- ❌ No atomic reservation for promotions

**Fix Required:**
```sql
-- Use database-level locking
CREATE FUNCTION reserve_promotion_atomic(
  p_promotion_id UUID,
  p_payment_intent_id TEXT,
  p_customer_email TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  max_redemptions INTEGER;
BEGIN
  -- Lock promotion row
  SELECT redeemed_count, max_redemptions
  INTO current_count, max_redemptions
  FROM promotions
  WHERE id = p_promotion_id
  FOR UPDATE; -- Row-level lock
  
  -- Check limit
  IF max_redemptions IS NOT NULL AND current_count >= max_redemptions THEN
    RETURN FALSE;
  END IF;
  
  -- Increment count atomically
  UPDATE promotions
  SET redeemed_count = redeemed_count + 1
  WHERE id = p_promotion_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

### 6. Abuse Scenarios

#### 6.1 Multiple Accounts

**Scenario:** User creates multiple accounts to use promo multiple times.

**Current Protection:**
- ❌ No per-email/IP limits
- ❌ No device fingerprinting
- ❌ No account verification

**Recommendation:**
```typescript
// Add per-email limit
const emailRedemptions = await getRedemptionsByEmail(customerEmail, promotionId);
if (emailRedemptions >= MAX_PER_EMAIL) {
  return { error: 'Promotion limit reached for this email' };
}

// Add IP-based rate limiting
const ipRedemptions = await getRedemptionsByIP(clientIP, promotionId);
if (ipRedemptions >= MAX_PER_IP) {
  return { error: 'Promotion limit reached for this IP' };
}
```

#### 6.2 Automation/Bot Abuse

**Scenario:** Automated scripts apply promo codes rapidly.

**Current Protection:**
- ✅ Rate limiting on payment intent creation
- ❌ No specific promo code rate limiting
- ❌ No CAPTCHA for promo code entry

**Recommendation:**
```typescript
// Add promo-specific rate limiting
const promoRateLimit = checkRateLimit(
  `promo:${promoCode}:${clientIP}`,
  5, // 5 attempts
  60000 // per minute
);
```

#### 6.3 Price Manipulation

**Scenario:** User manipulates client-side price before submission.

**Current Protection:**
- ✅ Server-side price validation
- ✅ Price mismatch detection
- ✅ Server-calculated pricing

**Status:** ✅ Well protected

### 7. Virtual Promo Codes (Ramadan)

**Issue:** Virtual promo codes skip database reservations and limits.

**Current Behavior:**
- No database reservation
- No redemption tracking
- No per-customer limits
- Only time-bound validation

**Risk:** Unlimited usage during promo period.

**Recommendation:**
```typescript
// Track virtual promo redemptions
async function recordVirtualPromoRedemption(
  promoCode: string,
  paymentIntentId: string,
  customerEmail: string
) {
  // Use promotion_redemptions table even for virtual codes
  await supabase.rpc('record_promotion_redemption', {
    p_promotion_id: 'ramadan-promo-id', // Store actual promo ID
    p_payment_intent_id: paymentIntentId,
    p_customer_email: customerEmail,
    // ... pricing details
  });
}
```

## Logging and Observability

### Current Logging Gaps

**Missing Logs:**
- ❌ Promotion validation failures
- ❌ Promo expiry during checkout
- ❌ Timezone discrepancies
- ❌ Duplicate redemption attempts
- ❌ Abuse pattern detection

### Recommended Logging

```typescript
// Structured logging for promotions
interface PromoLogEvent {
  event: 'promo_calculated' | 'promo_applied' | 'promo_expired' | 'promo_abuse';
  promotionId?: string;
  promoCode?: string;
  paymentIntentId?: string;
  customerEmail?: string; // Sanitized
  timestamp: string;
  metadata: {
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
    promoActive: boolean;
    timezone?: string;
  };
}

// Log promotion calculations
async function logPromoCalculation(event: PromoLogEvent) {
  await supabase.from('promo_audit_log').insert({
    event_type: event.event,
    promotion_id: event.promotionId,
    promo_code: event.promoCode,
    payment_intent_id: event.paymentIntentId,
    customer_email_hash: hashEmail(event.customerEmail), // Hash for privacy
    metadata: event.metadata,
    created_at: new Date().toISOString(),
  });
}
```

### Observability Metrics

**Key Metrics to Track:**
1. **Promotion Usage:**
   - Redemptions per hour/day
   - Average discount amount
   - Conversion rate with/without promo

2. **Abuse Indicators:**
   - Multiple redemptions per email/IP
   - Rapid-fire redemption attempts
   - Failed validation attempts

3. **Timing Issues:**
   - Promo expiry during checkout
   - Timezone discrepancies
   - Retroactive discount applications

4. **Performance:**
   - Pricing API response time
   - Promotion lookup latency
   - Database query performance

## Recommendations Summary

### Immediate Actions (Critical)

1. **Add promo re-validation at payment completion**
   - Validate promotion status in webhook handler
   - Use PaymentIntent creation time for validation
   - Log discrepancies for analysis

2. **Enforce UTC consistently**
   - Use `toISOString()` everywhere
   - Use database `NOW()` for consistency
   - Document timezone handling

3. **Add per-customer limits**
   - Track redemptions per email
   - Add `max_per_customer` field to promotions
   - Enforce limits in validation

### Short-term (High Priority)

4. **Add atomic reservation for promotions**
   - Use database row-level locking
   - Prevent race conditions
   - Ensure atomic redemption count updates

5. **Track virtual promo redemptions**
   - Record Ramadan promo redemptions
   - Enable abuse detection
   - Support analytics

6. **Add comprehensive logging**
   - Log all promotion events
   - Track abuse patterns
   - Monitor timing discrepancies

### Long-term (Medium Priority)

7. **Add abuse prevention**
   - IP-based rate limiting
   - Device fingerprinting
   - CAPTCHA for promo entry

8. **Add retroactive discount support**
   - Re-check promotions at payment completion
   - Apply discounts if promo becomes active
   - Handle edge cases gracefully

9. **Add observability dashboard**
   - Real-time promotion metrics
   - Abuse detection alerts
   - Performance monitoring

## Implementation Priority

### Phase 1: Critical Fixes (Week 1)
- [ ] Promo re-validation at payment completion
- [ ] UTC enforcement
- [ ] Per-customer limit checks

### Phase 2: High Priority (Week 2-3)
- [ ] Atomic reservation system
- [ ] Virtual promo tracking
- [ ] Comprehensive logging

### Phase 3: Medium Priority (Month 2)
- [ ] Abuse prevention enhancements
- [ ] Retroactive discount support
- [ ] Observability dashboard

## Testing Checklist

### Edge Case Tests

- [ ] Promo expires during checkout
- [ ] Promo starts during checkout
- [ ] Timezone boundary conditions
- [ ] Simultaneous redemption attempts
- [ ] Multiple accounts with same promo
- [ ] Virtual promo code abuse
- [ ] Price manipulation attempts
- [ ] Rapid-fire promo applications

### Integration Tests

- [ ] PaymentIntent creation with active promo
- [ ] PaymentIntent creation with expired promo
- [ ] Payment completion with expired promo
- [ ] Payment completion with newly active promo
- [ ] Duplicate redemption prevention
- [ ] Reservation expiration handling

## Conclusion

The promotion system has solid foundations but requires enhancements for edge case handling, abuse prevention, and observability. Critical issues around promo expiry and timezone handling should be addressed immediately.

**Overall Risk Level:** 🟡 **Medium-High**

**Recommended Action:** Implement Phase 1 fixes immediately, then proceed with Phase 2 enhancements.
