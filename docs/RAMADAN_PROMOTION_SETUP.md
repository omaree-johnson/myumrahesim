# Ramadan Umrah Promotion - Setup Summary

## Quick Start

### Option 1: Automatic (Recommended)

If `ramadan_promo_periods` table is populated:

```bash
# Run the seed SQL
psql -f supabase/seeds/017_ramadan_promotion_seed.sql
```

The seed automatically pulls dates from `ramadan_promo_periods` table.

### Option 2: Manual Dates

If `ramadan_promo_periods` is not available:

1. **Calculate dates** for current Hijri year:
   - 15 Sha'ban → Gregorian date
   - Last day of Ramadan → Gregorian date

2. **Update** `supabase/seeds/017_ramadan_promotion_simple.sql` with dates

3. **Run** the seed SQL

## Promotion Details

| Field | Value |
|-------|-------|
| **Name** | Ramadan Umrah Promotion |
| **Code** | `RAMADAN10` |
| **Discount** | 10% off |
| **Applies to** | Umrah eSIM plans only (`applies_to = 'esim'`) |
| **Period** | 15 Sha'ban → Last day of Ramadan |
| **Priority** | 100 (high priority) |
| **Redemptions** | Unlimited |

## Yearly Update Process

### Step 1: Calculate Dates

Use one of these methods:

**Method A: Online Converter**
- Visit: https://www.islamicfinder.org/islamic-date-converter/
- Convert: 15 Sha'ban [current year] → Gregorian
- Convert: 30 Ramadan [current year] → Gregorian

**Method B: hijri-date Library**
```typescript
import HijriDate from 'hijri-date';

const hijriYear = 1446; // Current Hijri year
const startDate = new HijriDate(hijriYear, 8, 15).toGregorian(); // 15 Sha'ban
const endDate = new HijriDate(hijriYear, 9, 30).toGregorian(); // 30 Ramadan
```

**Method C: Use ramadan_promo_periods**
```sql
SELECT start_date, end_date, hijri_year
FROM ramadan_promo_periods
WHERE hijri_year = 1446; -- Current Hijri year
```

### Step 2: Update Promotion

**Option A: Update via SQL**
```sql
UPDATE public.promotions
SET 
  starts_at = '2025-02-15 00:00:00+00',  -- 15 Sha'ban
  ends_at = '2025-04-10 23:59:59+00',    -- Last day of Ramadan
  redeemed_count = 0,                     -- Reset for new year
  updated_at = NOW()
WHERE promo_code = 'RAMADAN10';
```

**Option B: Re-run Seed SQL**
```bash
psql -f supabase/seeds/017_ramadan_promotion_simple.sql
```

### Step 3: Verify

```sql
SELECT 
  name,
  promo_code,
  discount_percent,
  starts_at,
  ends_at,
  is_active,
  redeemed_count
FROM promotions
WHERE promo_code = 'RAMADAN10';
```

## Files Created

1. **`supabase/seeds/017_ramadan_promotion_seed.sql`**
   - Automatic date lookup from `ramadan_promo_periods`
   - Falls back to explicit dates if table not available

2. **`supabase/seeds/017_ramadan_promotion_simple.sql`**
   - Simple version with explicit dates
   - Easy to update manually

3. **`docs/RAMADAN_PROMOTION_YEARLY_UPDATE.md`**
   - Comprehensive yearly update guide
   - Includes automation scripts and best practices

## Integration

The promotion integrates with:
- ✅ `promotions` table (new promotional pricing schema)
- ✅ `ramadan_promo_periods` table (pre-calculated date ranges)
- ✅ Existing discount system (`discount_codes` table)
- ✅ Application logic (auto-apply or code-based)

## Testing

Before Ramadan begins, test the promotion:

```sql
-- Check if promotion is active (should return false before Ramadan)
SELECT * FROM get_active_promotion('esim', 'RAMADAN10');

-- Check if promotion will be active on a specific date
SELECT * FROM get_active_promotion('esim', 'RAMADAN10', '2025-03-01 12:00:00+00'::TIMESTAMPTZ);
```

## Monitoring

During Ramadan, monitor redemptions:

```sql
SELECT 
  p.name,
  p.redeemed_count,
  COUNT(pr.id) as actual_redemptions,
  SUM(pr.discount_amount_cents) / 100.0 as total_discount_dollars
FROM promotions p
LEFT JOIN promotion_redemptions pr ON p.id = pr.promotion_id
WHERE p.promo_code = 'RAMADAN10'
GROUP BY p.id, p.name, p.redeemed_count;
```

## Troubleshooting

**Promotion not active?**
1. Check dates: `SELECT starts_at, ends_at FROM promotions WHERE promo_code = 'RAMADAN10';`
2. Verify current date is within range
3. Check `is_active = true`

**Dates incorrect?**
1. Re-calculate Hijri dates
2. Update `ramadan_promo_periods` table first
3. Re-run seed SQL

## Next Steps

1. ✅ Run seed SQL to create promotion record
2. ✅ Verify dates are correct
3. ✅ Test promotion lookup
4. ✅ Set calendar reminder for annual update
5. ✅ Document update process for team

For detailed instructions, see: `docs/RAMADAN_PROMOTION_YEARLY_UPDATE.md`
