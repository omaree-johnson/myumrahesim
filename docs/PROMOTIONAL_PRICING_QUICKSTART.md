# Promotional Pricing - Quick Start Guide

## Setup

### 1. Run Migration

```sql
-- Via Supabase Dashboard SQL Editor
-- Run: supabase/migrations/016_promotional_pricing.sql
```

### 2. Create Your First Promotion

#### Auto-Applied Promotion (No Code Required)

```sql
INSERT INTO promotions (
  name,
  description,
  promo_code,  -- NULL = auto-applied
  discount_percent,
  starts_at,
  ends_at,
  applies_to,
  priority,
  created_by
) VALUES (
  'Ramadan 2025 Auto-Promo',
  '10% off all Umrah eSIMs during Ramadan',
  NULL,  -- Auto-applied, no code needed
  10,
  '2025-02-15 00:00:00+00',  -- Start: 15 Sha'ban
  '2025-04-10 23:59:59+00',  -- End: Last day of Ramadan
  'esim',  -- Umrah eSIMs only
  100,  -- High priority
  'admin'
);
```

#### Code-Based Promotion

```sql
INSERT INTO promotions (
  name,
  promo_code,
  discount_percent,
  starts_at,
  ends_at,
  applies_to,
  max_redemptions,
  priority
) VALUES (
  'Early Bird Special',
  'EARLYBIRD20',
  20,
  '2025-01-01 00:00:00+00',
  '2025-03-31 23:59:59+00',
  'esim',
  1000,  -- Limited to 1000 uses
  50
);
```

## Usage in Application Code

### Check for Active Promotion

```typescript
import { supabaseAdmin as supabase } from '@/lib/supabase';

// Get active auto-applied promotion
const { data: promotion } = await supabase
  .rpc('get_active_promotion', {
    p_applies_to: 'esim',
    p_promo_code: null,  // NULL for auto-applied
  })
  .maybeSingle();

if (promotion) {
  // Apply discount
  const discountPercent = promotion.discount_percent;
  // ... calculate discounted price
}
```

### Check by Promo Code

```typescript
// Get promotion by code
const { data: promotion } = await supabase
  .rpc('get_active_promotion', {
    p_applies_to: 'esim',
    p_promo_code: 'EARLYBIRD20',
  })
  .maybeSingle();
```

### Record Redemption

```typescript
// After successful payment
await supabase.rpc('record_promotion_redemption', {
  p_promotion_id: promotion.id,
  p_payment_intent_id: paymentIntent.id,
  p_transaction_id: transactionId,
  p_customer_email: customerEmail,
  p_discount_amount_cents: discountAmount,
  p_original_amount_cents: originalAmount,
  p_discounted_amount_cents: finalAmount,
});
```

## Key Features

✅ **Time-bound**: Automatic start/end based on timestamps  
✅ **Optional codes**: NULL for auto-applied, unique code for manual entry  
✅ **Stacking prevention**: Only highest priority promotion is applied  
✅ **Umrah eSIM only**: Use `applies_to = 'esim'`  
✅ **Redemption tracking**: Full audit trail of all redemptions  
✅ **Usage limits**: Set `max_redemptions` for limited offers  

## Stacking Prevention

The schema **prevents stacking** by design:

1. **Priority-based**: Only highest priority promotion is returned
2. **Single redemption**: Unique constraint on `payment_intent_id`
3. **Application logic**: Apply only one promotion per transaction

Example:
- Promotion A (priority 10, 15% off)
- Promotion B (priority 20, 10% off)
- **Result**: Only Promotion B is applied (higher priority)

## Monitoring

### Check Active Promotions

```sql
SELECT 
  name,
  promo_code,
  discount_percent,
  starts_at,
  ends_at,
  redeemed_count,
  max_redemptions
FROM promotions
WHERE is_active = true
  AND NOW() BETWEEN starts_at AND ends_at
ORDER BY priority DESC;
```

### View Redemptions

```sql
SELECT 
  p.name,
  pr.payment_intent_id,
  pr.discount_amount_cents / 100.0 as discount_dollars,
  pr.redeemed_at
FROM promotion_redemptions pr
JOIN promotions p ON pr.promotion_id = p.id
ORDER BY pr.redeemed_at DESC
LIMIT 100;
```
