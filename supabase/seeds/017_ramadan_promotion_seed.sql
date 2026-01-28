-- Seed: Ramadan Umrah Promotion
-- Inserts the annual Ramadan promotional pricing record
-- This promotion runs from 15 Sha'ban to the last day of Ramadan each year
--
-- PREREQUISITES (REQUIRED):
-- 1. Run migration 016_promotional_pricing.sql FIRST (creates promotions table)
--    This migration is REQUIRED - the seed will fail with a clear error if missing.
--
-- PREREQUISITES (OPTIONAL):
-- 2. Run migration 015_ramadan_promo_periods.sql (for automatic date lookup)
--    This is optional - seed will use fallback dates if table doesn't exist.
--
-- YEARLY UPDATE REQUIRED:
-- 1. Calculate 15 Sha'ban and last day of Ramadan for current Hijri year
-- 2. Update the dates in this file OR use ramadan_promo_periods table
-- 3. Run this seed SQL annually before Ramadan begins
-- See: docs/RAMADAN_PROMOTION_YEARLY_UPDATE.md
--
-- NOTE: This seed will work even if ramadan_promo_periods table doesn't exist.
-- It will fall back to explicit dates defined in the code.

BEGIN;

-- ============================================================================
-- OPTION 1: Use ramadan_promo_periods table (if pre-calculated)
-- ============================================================================
-- This automatically pulls dates from the ramadan_promo_periods table
-- Ensure the table is populated first via:
-- POST /api/admin/precalculate-ramadan-periods?years=10

DO $$
DECLARE
  promo_start_date DATE;
  promo_end_date DATE;
  current_hijri_year INTEGER;
  ramadan_table_exists BOOLEAN;
  promotions_table_exists BOOLEAN;
BEGIN
  -- Check if promotions table exists (required)
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'promotions'
  ) INTO promotions_table_exists;
  
  IF NOT promotions_table_exists THEN
    RAISE EXCEPTION 'Promotions table does not exist. Please run migration 016_promotional_pricing.sql first.';
  END IF;
  
  -- Check if ramadan_promo_periods table exists (optional)
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'ramadan_promo_periods'
  ) INTO ramadan_table_exists;
  
  -- Try to get dates from ramadan_promo_periods table if it exists
  IF ramadan_table_exists THEN
    BEGIN
      SELECT 
        start_date,
        end_date,
        hijri_year
      INTO promo_start_date, promo_end_date, current_hijri_year
      FROM public.ramadan_promo_periods
      WHERE end_date >= CURRENT_DATE
      ORDER BY hijri_year ASC
      LIMIT 1;
    EXCEPTION
      WHEN OTHERS THEN
        -- Table exists but query failed, fall through to explicit dates
        promo_start_date := NULL;
    END;
  END IF;
  
  -- If not found or table doesn't exist, use explicit dates
  IF promo_start_date IS NULL THEN
    -- Fallback to explicit dates for 2025 (Hijri 1446)
    -- UPDATE THESE DATES ANNUALLY
    -- To calculate: Use hijri-date library or online converter
    -- For Hijri 1446 (2025):
    --   15 Sha'ban 1446 ≈ February 15, 2025
    --   30 Ramadan 1446 ≈ April 10, 2025
    promo_start_date := '2025-02-15'::DATE;  -- 15 Sha'ban 1446
    promo_end_date := '2025-04-10'::DATE;   -- 30 Ramadan 1446
    current_hijri_year := 1446;
  END IF;
  
  -- Insert or update promotion
  INSERT INTO public.promotions (
    name,
    description,
    promo_code,
    discount_percent,
    min_purchase_amount_cents,
    max_discount_amount_cents,
    starts_at,
    ends_at,
    is_active,
    applies_to,
    max_redemptions,
    redeemed_count,
    priority,
    created_by,
    notes
  ) VALUES (
    'Ramadan Umrah Promotion',
    '10% off all Umrah eSIM plans during the holy month of Ramadan. Valid from 15 Sha''ban until the end of Ramadan.',
    'RAMADAN10',
    10,
    0, -- No minimum purchase required
    NULL, -- No maximum discount cap
    promo_start_date::TIMESTAMPTZ + INTERVAL '0 hours',
    promo_end_date::TIMESTAMPTZ + INTERVAL '23 hours 59 minutes 59 seconds',
    true,
    'esim', -- Umrah eSIM plans only
    NULL, -- Unlimited redemptions
    0, -- Reset redemption count for new year
    100, -- High priority (wins over other promotions)
    'admin',
    'Annual Ramadan promotion for Hijri ' || current_hijri_year || '. Dates: ' || 
    promo_start_date::TEXT || ' to ' || promo_end_date::TEXT || '. Last updated: ' || NOW()::TEXT
  )
  ON CONFLICT (promo_code) DO UPDATE SET
    starts_at = EXCLUDED.starts_at,
    ends_at = EXCLUDED.ends_at,
    redeemed_count = 0, -- Reset for new year
    updated_at = NOW(),
    notes = EXCLUDED.notes;
END $$;

-- ============================================================================
-- OPTION 2: Manual date insertion (alternative approach)
-- ============================================================================
-- If you prefer explicit dates, uncomment and update the dates below:
-- 
-- UPDATE THESE DATES ANNUALLY:
-- - Calculate 15 Sha'ban for current Hijri year
-- - Calculate last day of Ramadan (30 Ramadan) for current Hijri year
-- - Use online Hijri converter or hijri-date library
--
-- Example for Hijri 1446 (2025):
--   Start: 15 Sha'ban 1446 = February 15, 2025
--   End: 30 Ramadan 1446 = April 10, 2025

/*
INSERT INTO public.promotions (
  name,
  description,
  promo_code,
  discount_percent,
  min_purchase_amount_cents,
  max_discount_amount_cents,
  starts_at,
  ends_at,
  is_active,
  applies_to,
  max_redemptions,
  redeemed_count,
  priority,
  created_by,
  notes
) VALUES (
  'Ramadan Umrah Promotion',
  '10% off all Umrah eSIM plans during the holy month of Ramadan. Valid from 15 Sha''ban until the end of Ramadan.',
  'RAMADAN10',
  10,
  0,
  NULL,
  '2025-02-15 00:00:00+00', -- UPDATE: 15 Sha'ban (current Hijri year)
  '2025-04-10 23:59:59+00', -- UPDATE: Last day of Ramadan (current Hijri year)
  true,
  'esim',
  NULL,
  0,
  100,
  'admin',
  'Annual Ramadan promotion. Update dates yearly before Ramadan begins.'
)
ON CONFLICT (promo_code) DO UPDATE SET
  starts_at = EXCLUDED.starts_at,
  ends_at = EXCLUDED.ends_at,
  redeemed_count = 0,
  updated_at = NOW(),
  notes = 'Annual Ramadan promotion. Last updated: ' || NOW()::TEXT;
*/

COMMIT;
