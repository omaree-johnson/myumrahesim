# Promotion System Audit - Quick Reference

## Critical Edge Cases

### 🔴 Promo Expiry During Checkout
**Problem:** Promo expires between pricing calculation and payment completion  
**Fix:** Re-validate in webhook using PaymentIntent creation time  
**Status:** ⚠️ Needs implementation

### 🔴 Timezone Inconsistencies  
**Problem:** Multiple timezone sources cause inconsistent status  
**Fix:** Enforce UTC everywhere (`toISOString()`, database `NOW()`)  
**Status:** ⚠️ Needs implementation

### 🟡 Orders Before Promo Window
**Problem:** User starts checkout before promo, completes after  
**Fix:** Re-check at payment completion, apply retroactively  
**Status:** 📋 Recommended

### 🟡 Duplicate Discount Prevention
**Problem:** Users bypass limits with multiple accounts  
**Fix:** Add per-customer limits, atomic reservations  
**Status:** ⚠️ Needs implementation

### 🟡 Race Conditions
**Problem:** Concurrent requests bypass duplicate prevention  
**Fix:** Database row-level locking (`FOR UPDATE`)  
**Status:** ⚠️ Needs implementation

## Quick Fixes

### 1. Add Promo Re-Validation (5 min)

```typescript
// In webhook handler
const validation = await validatePromotionAtPaymentIntent(
  paymentIntent.id,
  paymentIntent.metadata.promotion_id
);
if (!validation.valid) {
  await logPromoExpiryDiscrepancy(...);
}
```

### 2. Enforce UTC (10 min)

```typescript
// Replace all Date() with:
const now = new Date().toISOString(); // Always UTC
```

### 3. Add Per-Customer Limits (15 min)

```typescript
const limitCheck = await checkCustomerPromoLimit(
  customerEmail,
  promotionId,
  maxPerCustomer
);
```

## Files to Update

### Critical (P0)
- `src/app/api/webhooks/stripe/route.ts` - Add re-validation
- `src/lib/pricing-calculator.ts` - Enforce UTC

### High Priority (P1)
- `src/lib/pricing-calculator.ts` - Add per-customer checks
- `src/lib/promotion-validation.ts` - Use new utilities

### Recommended (P2)
- `src/lib/promotion-logging.ts` - Add comprehensive logging
- `src/lib/promotion-abuse-detection.ts` - Add abuse detection

## Database Migrations

Run in order:
1. `016_promotional_pricing.sql` (already applied)
2. `017_promotion_validation_enhancements.sql` (NEW - run this)

## Testing

```bash
# Test promo expiry
curl -X POST /api/pricing -d '{"offerId":"SA-10GB-7D"}'
# Wait for promo to expire
curl -X POST /api/create-payment-intent -d '{...}'
# Verify re-validation in webhook

# Test timezone
# Set server timezone to different zone
# Verify consistent promo status
```

## Monitoring

```sql
-- Check for expiry discrepancies
SELECT * FROM promo_audit_log 
WHERE event_type = 'promo_expired' 
ORDER BY created_at DESC;

-- Check for abuse
SELECT * FROM promo_audit_log 
WHERE event_type = 'promo_abuse' 
ORDER BY created_at DESC;
```

## Status Checklist

- [ ] Promo re-validation in webhook
- [ ] UTC enforcement
- [ ] Per-customer limits
- [ ] Atomic reservations
- [ ] Comprehensive logging
- [ ] Abuse detection
- [ ] Monitoring queries
- [ ] Integration tests

## Priority Order

1. **Week 1:** Promo expiry + Timezone fixes
2. **Week 2:** Per-customer limits + Atomic reservations  
3. **Week 3:** Logging + Abuse detection
4. **Month 2:** Advanced abuse prevention
