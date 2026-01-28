# Ramadan Promotion - Yearly Update Guide

## Overview

The **Ramadan Umrah Promotion** is an annual promotional pricing campaign that runs from **15 Sha'ban** until the **last day of Ramadan** each Hijri year. This guide explains how to update the promotion record yearly.

## Promotion Details

- **Name**: Ramadan Umrah Promotion
- **Code**: `RAMADAN10`
- **Discount**: 10% off
- **Applies to**: Umrah eSIM plans only (`applies_to = 'esim'`)
- **Period**: 15 Sha'ban → Last day of Ramadan (inclusive)
- **Priority**: 100 (high priority, wins over other promotions)

## Yearly Update Process

### Option 1: Automatic Update (Recommended)

The seed SQL (`017_ramadan_promotion_seed.sql`) automatically pulls dates from the `ramadan_promo_periods` table. If this table is pre-populated, the promotion dates update automatically.

**Prerequisites:**
1. Ensure `ramadan_promo_periods` table is populated for upcoming years
2. Run the pre-calculation API: `POST /api/admin/precalculate-ramadan-periods?years=10`

**Update Steps:**
1. Run the seed SQL: `supabase/seeds/017_ramadan_promotion_seed.sql`
2. The `ON CONFLICT` clause automatically updates dates from `ramadan_promo_periods`
3. Redemption count is reset to 0 for the new year

### Option 2: Manual Date Update

If `ramadan_promo_periods` is not available, manually calculate and update dates.

#### Step 1: Calculate Hijri Dates

Use the `hijri-date` library or an online converter to find:
- **15 Sha'ban** of the current Hijri year (Gregorian equivalent)
- **Last day of Ramadan** (30 Ramadan) of the current Hijri year (Gregorian equivalent)

**Example for Hijri 1446 (2025):**
- 15 Sha'ban 1446 ≈ February 15, 2025
- 30 Ramadan 1446 ≈ April 10, 2025

#### Step 2: Update Promotion Record

```sql
UPDATE public.promotions
SET 
  starts_at = '2025-02-15 00:00:00+00',  -- 15 Sha'ban (update annually)
  ends_at = '2025-04-10 23:59:59+00',    -- Last day of Ramadan (update annually)
  redeemed_count = 0,                     -- Reset for new year
  updated_at = NOW(),
  notes = 'Annual Ramadan promotion. Updated for Hijri 1446. Last updated: ' || NOW()::TEXT
WHERE promo_code = 'RAMADAN10';
```

#### Step 3: Verify Dates

```sql
SELECT 
  name,
  promo_code,
  discount_percent,
  starts_at,
  ends_at,
  is_active,
  redeemed_count,
  notes
FROM public.promotions
WHERE promo_code = 'RAMADAN10';
```

## Automated Yearly Update Script

### Using Node.js/TypeScript

```typescript
import { supabaseAdmin as supabase } from '@/lib/supabase';
import HijriDate from 'hijri-date';

async function updateRamadanPromotionForYear(hijriYear: number) {
  // Calculate dates
  const hijriStartDate = new HijriDate(hijriYear, 8, 15); // 15 Sha'ban
  const gregorianStart = hijriStartDate.toGregorian();
  
  const hijriEndDate = new HijriDate(hijriYear, 9, 30); // 30 Ramadan
  const gregorianEnd = hijriEndDate.toGregorian();
  
  // Format for PostgreSQL
  const startsAt = `${gregorianStart.toISOString().split('T')[0]} 00:00:00+00`;
  const endsAt = `${gregorianEnd.toISOString().split('T')[0]} 23:59:59+00`;
  
  // Update promotion
  const { error } = await supabase
    .from('promotions')
    .update({
      starts_at: startsAt,
      ends_at: endsAt,
      redeemed_count: 0,
      updated_at: new Date().toISOString(),
      notes: `Annual Ramadan promotion. Updated for Hijri ${hijriYear}. Last updated: ${new Date().toISOString()}`,
    })
    .eq('promo_code', 'RAMADAN10');
  
  if (error) {
    throw new Error(`Failed to update promotion: ${error.message}`);
  }
  
  console.log(`✅ Updated Ramadan promotion for Hijri ${hijriYear}`);
  console.log(`   Start: ${startsAt}`);
  console.log(`   End: ${endsAt}`);
}

// Usage: Update for current Hijri year
const today = new Date();
const hijriToday = (today as any).toHijri();
const currentHijriYear = hijriToday.getFullYear();

await updateRamadanPromotionForYear(currentHijriYear);
```

### Using SQL Function

Create a SQL function to auto-update from `ramadan_promo_periods`:

```sql
CREATE OR REPLACE FUNCTION public.update_ramadan_promotion_dates()
RETURNS void AS $$
DECLARE
  current_period RECORD;
BEGIN
  -- Get current active period (or most recent)
  SELECT * INTO current_period
  FROM public.ramadan_promo_periods
  WHERE CURRENT_DATE <= end_date
  ORDER BY hijri_year DESC
  LIMIT 1;
  
  IF FOUND THEN
    UPDATE public.promotions
    SET 
      starts_at = current_period.start_date::TIMESTAMPTZ + INTERVAL '0 hours',
      ends_at = current_period.end_date::TIMESTAMPTZ + INTERVAL '23 hours 59 minutes 59 seconds',
      redeemed_count = 0,
      updated_at = NOW(),
      notes = 'Annual Ramadan promotion. Dates auto-updated from ramadan_promo_periods. Last updated: ' || NOW()::TEXT
    WHERE promo_code = 'RAMADAN10';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Run the function
SELECT public.update_ramadan_promotion_dates();
```

## Best Practices

### 1. Update Timing

- **Best**: Update 1-2 months before Ramadan begins
- **Minimum**: Update at least 1 week before 15 Sha'ban
- **Reminder**: Set calendar reminder for annual update

### 2. Verification Checklist

After updating, verify:
- [ ] `starts_at` matches 15 Sha'ban (Gregorian)
- [ ] `ends_at` matches last day of Ramadan (Gregorian)
- [ ] `is_active = true`
- [ ] `redeemed_count = 0` (reset for new year)
- [ ] `applies_to = 'esim'`
- [ ] `discount_percent = 10`
- [ ] `promo_code = 'RAMADAN10'`

### 3. Testing

Before Ramadan begins, test the promotion:
```sql
-- Check if promotion is active (should return false before Ramadan)
SELECT * FROM get_active_promotion('esim', 'RAMADAN10');

-- Check if promotion will be active on a specific date
SELECT * FROM get_active_promotion('esim', 'RAMADAN10', '2025-03-01 12:00:00+00'::TIMESTAMPTZ);
```

### 4. Monitoring

During Ramadan, monitor redemptions:
```sql
SELECT 
  p.name,
  p.promo_code,
  p.redeemed_count,
  p.max_redemptions,
  COUNT(pr.id) as actual_redemptions,
  SUM(pr.discount_amount_cents) / 100.0 as total_discount_dollars
FROM promotions p
LEFT JOIN promotion_redemptions pr ON p.id = pr.promotion_id
WHERE p.promo_code = 'RAMADAN10'
GROUP BY p.id, p.name, p.promo_code, p.redeemed_count, p.max_redemptions;
```

## Integration with Existing System

The Ramadan promotion integrates with:
- **`ramadan_promo_periods` table**: Pre-calculated date ranges
- **`promotions` table**: Promotional pricing rules
- **`promotion_redemptions` table**: Redemption tracking
- **Existing discount system**: Can coexist with `discount_codes` table

The promotion can be:
- **Auto-applied**: If no manual code is entered (via application logic)
- **Code-based**: Customers can enter `RAMADAN10` manually

## Troubleshooting

### Issue: Promotion not showing as active

**Check:**
1. Dates are correct: `SELECT starts_at, ends_at FROM promotions WHERE promo_code = 'RAMADAN10';`
2. Current date is within range: `SELECT NOW() BETWEEN starts_at AND ends_at;`
3. `is_active = true`
4. Redemption limit not reached: `redeemed_count < max_redemptions`

### Issue: Dates incorrect

**Solution:**
1. Verify Hijri dates using online converter or `hijri-date` library
2. Update `ramadan_promo_periods` table first
3. Re-run seed SQL or manual update

### Issue: Redemption count not resetting

**Solution:**
```sql
UPDATE promotions
SET redeemed_count = 0
WHERE promo_code = 'RAMADAN10';
```

## Summary

**Yearly Update Process:**
1. Calculate 15 Sha'ban and last day of Ramadan for current Hijri year
2. Update `promotions` table with new dates
3. Reset `redeemed_count` to 0
4. Verify dates and active status
5. Test before Ramadan begins

**Automation:**
- Use `ramadan_promo_periods` table for automatic date lookup
- Create scheduled job to run update function annually
- Use admin API endpoint for pre-calculation
