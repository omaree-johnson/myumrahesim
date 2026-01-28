-- Migration: Promotion Validation Enhancements
-- Adds database functions and constraints for edge case handling
--
-- PREREQUISITE (REQUIRED):
-- This migration requires migration 016_promotional_pricing.sql to be run first
-- (creates the promotions table)

BEGIN;

-- ============================================================================
-- PREREQUISITE CHECK
-- ============================================================================

-- Verify promotions table exists
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

-- ============================================================================
-- SCHEMA ENHANCEMENTS
-- ============================================================================

-- Add max_per_customer field to promotions table
ALTER TABLE public.promotions
ADD COLUMN IF NOT EXISTS max_per_customer INTEGER DEFAULT 1 CHECK (max_per_customer >= 1);

COMMENT ON COLUMN public.promotions.max_per_customer IS 
  'Maximum number of times a single customer (email) can redeem this promotion. Default: 1.';

-- ============================================================================
-- FUNCTIONS FOR EDGE CASE VALIDATION
-- ============================================================================

-- Function: Check if promotion is active at a specific time
CREATE OR REPLACE FUNCTION public.is_promotion_active_at_time(
  p_promotion_id UUID,
  p_check_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS BOOLEAN AS $$
DECLARE
  promo RECORD;
BEGIN
  SELECT * INTO promo
  FROM public.promotions
  WHERE id = p_promotion_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check active status
  IF NOT promo.is_active THEN
    RETURN FALSE;
  END IF;
  
  -- Check time range (using database NOW() for consistency)
  IF p_check_time < promo.starts_at OR p_check_time > promo.ends_at THEN
    RETURN FALSE;
  END IF;
  
  -- Check redemption limits
  IF promo.max_redemptions IS NOT NULL AND promo.redeemed_count >= promo.max_redemptions THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Check customer redemption count for a promotion
CREATE OR REPLACE FUNCTION public.check_customer_promo_limit(
  p_customer_email TEXT,
  p_promotion_id UUID,
  p_max_per_customer INTEGER DEFAULT 1
)
RETURNS TABLE (
  within_limit BOOLEAN,
  current_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) < p_max_per_customer AS within_limit,
    COUNT(*) AS current_count
  FROM public.promotion_redemptions
  WHERE customer_email = LOWER(TRIM(p_customer_email))
    AND promotion_id = p_promotion_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Atomic promotion reservation with row-level locking
CREATE OR REPLACE FUNCTION public.reserve_promotion_atomic(
  p_promotion_id UUID,
  p_payment_intent_id TEXT,
  p_customer_email TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  max_redemptions INTEGER;
  promo_active BOOLEAN;
  promo_ends_at TIMESTAMPTZ;
BEGIN
  -- Lock promotion row and check status
  SELECT 
    redeemed_count,
    max_redemptions,
    is_active,
    ends_at
  INTO 
    current_count,
    max_redemptions,
    promo_active,
    promo_ends_at
  FROM public.promotions
  WHERE id = p_promotion_id
  FOR UPDATE; -- Row-level lock prevents race conditions
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if promotion is still active
  IF NOT promo_active THEN
    RETURN FALSE;
  END IF;
  
  -- Check if promotion has expired
  IF NOW() > promo_ends_at THEN
    RETURN FALSE;
  END IF;
  
  -- Check redemption limit
  IF max_redemptions IS NOT NULL AND current_count >= max_redemptions THEN
    RETURN FALSE;
  END IF;
  
  -- Increment count atomically
  UPDATE public.promotions
  SET redeemed_count = redeemed_count + 1,
      updated_at = NOW()
  WHERE id = p_promotion_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for customer email + promotion lookups
CREATE INDEX IF NOT EXISTS idx_promotion_redemptions_email_promo 
  ON public.promotion_redemptions(customer_email, promotion_id)
  WHERE customer_email IS NOT NULL;

-- Index for abuse detection (rapid redemptions)
CREATE INDEX IF NOT EXISTS idx_promotion_redemptions_redeemed_at_promo 
  ON public.promotion_redemptions(redeemed_at, promotion_id);

-- ============================================================================
-- AUDIT LOG TABLE
-- ============================================================================

-- Table for promotion audit logging
CREATE TABLE IF NOT EXISTS public.promo_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'calculated', 'applied', 'expired', 'abuse', 'validation_failed'
  promotion_id UUID REFERENCES public.promotions(id) ON DELETE SET NULL,
  promo_code TEXT,
  payment_intent_id TEXT,
  customer_email_hash TEXT, -- Hashed for privacy
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_audit_log_event_type 
  ON public.promo_audit_log(event_type, created_at);

CREATE INDEX IF NOT EXISTS idx_promo_audit_log_promotion_id 
  ON public.promo_audit_log(promotion_id, created_at);

CREATE INDEX IF NOT EXISTS idx_promo_audit_log_payment_intent_id 
  ON public.promo_audit_log(payment_intent_id);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.is_promotion_active_at_time IS 
  'Checks if a promotion is active at a specific point in time. Uses UTC for consistency.';

COMMENT ON FUNCTION public.check_customer_promo_limit IS 
  'Checks if a customer has exceeded the per-customer limit for a promotion.';

COMMENT ON FUNCTION public.reserve_promotion_atomic IS 
  'Atomically reserves a promotion with row-level locking to prevent race conditions.';

COMMENT ON TABLE public.promo_audit_log IS 
  'Audit log for promotion events. Tracks calculations, applications, expirations, and abuse attempts.';

COMMIT;
