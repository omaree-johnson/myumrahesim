# Ramadan Promotion Setup - Migration Order

## Issue

The seed SQL `017_ramadan_promotion_seed.sql` may fail if the `ramadan_promo_periods` table doesn't exist.

## Solution

The seed SQL has been updated to gracefully handle missing tables. However, for best results, run migrations in the correct order.

## Migration Order

### Required Migrations (Must Run First)

1. **`016_promotional_pricing.sql`** - Creates `promotions` table
   - **Required:** Yes (promotions table must exist)
   - **Run:** Before seed SQL

### Optional Migrations (Recommended)

2. **`015_ramadan_promo_periods.sql`** - Creates `ramadan_promo_periods` table
   - **Required:** No (seed SQL has fallback)
   - **Run:** Before seed SQL for automatic date lookup
   - **Benefit:** Automatic date calculation from Hijri calendar

### Seed SQL

3. **`017_ramadan_promotion_seed.sql`** - Inserts Ramadan promotion
   - **Required:** After migrations above
   - **Works:** Even if `ramadan_promo_periods` doesn't exist (uses fallback dates)

## Quick Setup

### Option 1: With ramadan_promo_periods (Recommended)

```bash
# 1. Run migrations
psql -f supabase/migrations/015_ramadan_promo_periods.sql
psql -f supabase/migrations/016_promotional_pricing.sql

# 2. Pre-calculate periods (optional)
# POST /api/admin/precalculate-ramadan-periods?years=10

# 3. Run seed
psql -f supabase/seeds/017_ramadan_promotion_seed.sql
```

### Option 2: Without ramadan_promo_periods (Fallback)

```bash
# 1. Run required migration
psql -f supabase/migrations/016_promotional_pricing.sql

# 2. Run seed (will use explicit dates)
psql -f supabase/seeds/017_ramadan_promotion_seed.sql
```

## Verification

After running the seed, verify the promotion:

```sql
SELECT 
  name,
  promo_code,
  discount_percent,
  starts_at,
  ends_at,
  is_active
FROM promotions
WHERE promo_code = 'RAMADAN10';
```

## Troubleshooting

### Error: "relation 'promotions' does not exist"

**Solution:** Run migration `016_promotional_pricing.sql` first.

### Error: "relation 'ramadan_promo_periods' does not exist"

**Solution:** This is OK! The seed SQL will use fallback dates. If you want automatic dates, run migration `015_ramadan_promo_periods.sql` first.

### Dates are wrong

**Solution:** 
1. Check if `ramadan_promo_periods` table has correct dates
2. Or update explicit dates in seed SQL (lines 61-62)

## Current Fallback Dates

The seed SQL uses these fallback dates if `ramadan_promo_periods` table doesn't exist:

- **Start:** 2025-02-15 (15 Sha'ban 1446)
- **End:** 2025-04-10 (30 Ramadan 1446)

**Update these annually** before running the seed SQL.
