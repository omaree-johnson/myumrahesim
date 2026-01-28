-- Seed: Ramadan Umrah Promotion (Simple Version)
-- Quick setup with explicit dates for current year
-- 
-- PREREQUISITE (REQUIRED):
-- Run migration 016_promotional_pricing.sql FIRST to create the promotions table
-- 
-- INSTRUCTIONS:
-- 1. Calculate dates for current Hijri year:
--    - 15 Sha'ban → Gregorian date
--    - Last day of Ramadan (30 Ramadan) → Gregorian date
-- 2. Update the dates in this file
-- 3. Run this SQL before Ramadan begins each year

BEGIN;

-- Check if promotions table exists (required)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'promotions'
  ) THEN
    RAISE EXCEPTION 'Promotions table does not exist. Please run migration 016_promotional_pricing.sql first.';
  END IF;
END $$;

-- UPDATE THESE DATES ANNUALLY
-- For Hijri 1446 (2025):
--   Start: 15 Sha'ban 1446 = February 15, 2025
--   End: 30 Ramadan 1446 = April 10, 2025

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
  '2025-02-15 00:00:00+00', -- UPDATE: 15 Sha'ban (Gregorian date)
  '2025-04-10 23:59:59+00', -- UPDATE: Last day of Ramadan (Gregorian date)
  true,
  'esim', -- Umrah eSIM plans only
  NULL, -- Unlimited redemptions
  0, -- Reset redemption count for new year
  100, -- High priority (wins over other promotions)
  'admin',
  'Annual Ramadan promotion. Update dates yearly before Ramadan begins. Last updated: ' || NOW()::TEXT
)
ON CONFLICT (promo_code) DO UPDATE SET
  starts_at = EXCLUDED.starts_at,
  ends_at = EXCLUDED.ends_at,
  redeemed_count = 0, -- Reset for new year
  updated_at = NOW(),
  notes = 'Annual Ramadan promotion. Last updated: ' || NOW()::TEXT;

COMMIT;
