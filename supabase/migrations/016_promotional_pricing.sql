-- Migration: Promotional Pricing Schema
-- Supports time-bound promotions with optional promo codes
-- Prevents stacking of multiple active promotions
-- Designed for Umrah eSIM promotional pricing

BEGIN;

-- ============================================================================
-- PROMOTIONS TABLE
-- ============================================================================
-- Stores promotional pricing rules with time-bound validity
-- Supports both auto-applied and code-based promotions

CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Promotion identification
  name TEXT NOT NULL, -- Human-readable name (e.g., "Ramadan 2025 Promo")
  description TEXT, -- Optional description
  
  -- Promo code (optional - NULL for auto-applied promotions)
  promo_code TEXT UNIQUE, -- Optional unique code (e.g., "RAMADAN10")
  -- Constraint: Either promo_code is set OR it's an auto-applied promo
  -- Enforced via application logic (can't use CHECK with NULL uniqueness)
  
  -- Discount details
  discount_percent INTEGER NOT NULL CHECK (discount_percent >= 1 AND discount_percent <= 90),
  min_purchase_amount_cents INTEGER DEFAULT 0 CHECK (min_purchase_amount_cents >= 0),
  max_discount_amount_cents INTEGER, -- Optional cap on discount amount
  
  -- Time-bound validity
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT valid_date_range CHECK (ends_at > starts_at),
  
  -- Active status (can be manually disabled without deleting)
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Applicability
  applies_to TEXT NOT NULL DEFAULT 'esim' CHECK (applies_to IN ('esim', 'cart', 'topup', 'any')),
  -- For Umrah eSIMs only: applies_to should be 'esim' or 'any'
  -- Additional filtering can be done in application logic (e.g., country = 'SA')
  
  -- Usage limits
  max_redemptions INTEGER, -- NULL = unlimited
  redeemed_count INTEGER NOT NULL DEFAULT 0 CHECK (redeemed_count >= 0),
  
  -- Priority (higher priority wins if multiple active)
  priority INTEGER NOT NULL DEFAULT 0 CHECK (priority >= 0),
  -- When multiple promotions are active, highest priority is applied
  -- Prevents stacking by design
  
  -- Metadata
  created_by TEXT DEFAULT 'system',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for active promotions lookup (most common query)
CREATE INDEX IF NOT EXISTS idx_promotions_active_lookup 
  ON public.promotions(is_active, starts_at, ends_at, priority DESC)
  WHERE is_active = true;

-- Index for promo code lookup
CREATE INDEX IF NOT EXISTS idx_promotions_promo_code 
  ON public.promotions(promo_code)
  WHERE promo_code IS NOT NULL;

-- Index for time range queries
CREATE INDEX IF NOT EXISTS idx_promotions_time_range 
  ON public.promotions(starts_at, ends_at);

-- Index for applicability filtering
CREATE INDEX IF NOT EXISTS idx_promotions_applies_to 
  ON public.promotions(applies_to, is_active);

-- Composite index for active promotions by time and priority
CREATE INDEX IF NOT EXISTS idx_promotions_active_priority 
  ON public.promotions(is_active, priority DESC, starts_at, ends_at)
  WHERE is_active = true;

-- ============================================================================
-- PROMOTION REDEMPTIONS
-- ============================================================================
-- Tracks which promotions were applied to which transactions
-- Enables analytics and prevents duplicate application

CREATE TABLE IF NOT EXISTS public.promotion_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE RESTRICT,
  
  -- Transaction details
  payment_intent_id TEXT NOT NULL,
  transaction_id TEXT,
  customer_email TEXT,
  
  -- Discount applied
  discount_amount_cents INTEGER NOT NULL CHECK (discount_amount_cents >= 0),
  original_amount_cents INTEGER NOT NULL CHECK (original_amount_cents > 0),
  discounted_amount_cents INTEGER NOT NULL CHECK (discounted_amount_cents > 0),
  
  -- Metadata
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate redemptions for same payment intent
  CONSTRAINT uq_promotion_redemptions_payment_intent UNIQUE (payment_intent_id)
);

-- Indexes for promotion redemptions
CREATE INDEX IF NOT EXISTS idx_promotion_redemptions_promotion_id 
  ON public.promotion_redemptions(promotion_id);

CREATE INDEX IF NOT EXISTS idx_promotion_redemptions_transaction_id 
  ON public.promotion_redemptions(transaction_id);

CREATE INDEX IF NOT EXISTS idx_promotion_redemptions_customer_email 
  ON public.promotion_redemptions(customer_email);

CREATE INDEX IF NOT EXISTS idx_promotion_redemptions_redeemed_at 
  ON public.promotion_redemptions(redeemed_at);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Get active promotion for a given time and applicability
-- Returns the highest priority active promotion that matches criteria
CREATE OR REPLACE FUNCTION public.get_active_promotion(
  p_applies_to TEXT DEFAULT 'esim',
  p_promo_code TEXT DEFAULT NULL,
  p_check_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  promo_code TEXT,
  discount_percent INTEGER,
  min_purchase_amount_cents INTEGER,
  max_discount_amount_cents INTEGER,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  priority INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.promo_code,
    p.discount_percent,
    p.min_purchase_amount_cents,
    p.max_discount_amount_cents,
    p.starts_at,
    p.ends_at,
    p.priority
  FROM public.promotions p
  WHERE 
    p.is_active = true
    AND p_check_time >= p.starts_at
    AND p_check_time <= p.ends_at
    AND (p.applies_to = 'any' OR p.applies_to = p_applies_to)
    AND (
      -- If promo_code provided, match it exactly
      -- If NULL provided, get auto-applied promotions (promo_code IS NULL)
      (p_promo_code IS NOT NULL AND p.promo_code = p_promo_code)
      OR
      (p_promo_code IS NULL AND p.promo_code IS NULL)
    )
    AND (p.max_redemptions IS NULL OR p.redeemed_count < p.max_redemptions)
  ORDER BY p.priority DESC, p.starts_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Check if any promotion is currently active
CREATE OR REPLACE FUNCTION public.has_active_promotion(
  p_applies_to TEXT DEFAULT 'esim',
  p_check_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS BOOLEAN AS $$
DECLARE
  active_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO active_count
  FROM public.promotions
  WHERE 
    is_active = true
    AND p_check_time >= starts_at
    AND p_check_time <= ends_at
    AND (applies_to = 'any' OR applies_to = p_applies_to)
    AND (max_redemptions IS NULL OR redeemed_count < max_redemptions);
  
  RETURN active_count > 0;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Record promotion redemption and update count
CREATE OR REPLACE FUNCTION public.record_promotion_redemption(
  p_promotion_id UUID,
  p_payment_intent_id TEXT,
  p_discount_amount_cents INTEGER,
  p_original_amount_cents INTEGER,
  p_discounted_amount_cents INTEGER,
  p_transaction_id TEXT DEFAULT NULL,
  p_customer_email TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  redemption_id UUID;
BEGIN
  -- Insert redemption record
  INSERT INTO public.promotion_redemptions (
    promotion_id,
    payment_intent_id,
    transaction_id,
    customer_email,
    discount_amount_cents,
    original_amount_cents,
    discounted_amount_cents
  ) VALUES (
    p_promotion_id,
    p_payment_intent_id,
    p_transaction_id,
    p_customer_email,
    p_discount_amount_cents,
    p_original_amount_cents,
    p_discounted_amount_cents
  )
  RETURNING id INTO redemption_id;
  
  -- Update redemption count (best-effort, non-blocking)
  UPDATE public.promotions
  SET redeemed_count = redeemed_count + 1,
      updated_at = NOW()
  WHERE id = p_promotion_id;
  
  RETURN redemption_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_promotions_updated_at 
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- CONSTRAINTS & VALIDATIONS
-- ============================================================================

-- Ensure only one auto-applied promotion is active at a time for same applies_to
-- (Prevents stacking of auto-applied promos)
-- Note: This is enforced via application logic (get_active_promotion returns only one)
-- Database constraint would be complex due to time ranges, so we rely on priority

-- Ensure promo_code uniqueness (already handled by UNIQUE constraint)
-- Ensure date range validity (already handled by CHECK constraint)

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.promotions IS 
  'Promotional pricing rules. Supports time-bound promotions with optional promo codes. Only highest priority active promotion is applied (prevents stacking).';

COMMENT ON COLUMN public.promotions.promo_code IS 
  'Optional promo code. NULL for auto-applied promotions (e.g., Ramadan promo). Must be unique if set.';

COMMENT ON COLUMN public.promotions.priority IS 
  'Priority level. When multiple promotions are active, highest priority is applied. Prevents stacking.';

COMMENT ON COLUMN public.promotions.applies_to IS 
  'Applicability: esim (Umrah eSIMs only), cart, topup, or any. For Umrah eSIMs, use esim or any.';

COMMENT ON FUNCTION public.get_active_promotion IS 
  'Returns the highest priority active promotion matching criteria. Prevents stacking by design.';

COMMENT ON FUNCTION public.has_active_promotion IS 
  'Quick check if any promotion is currently active for given applicability.';

COMMENT ON FUNCTION public.record_promotion_redemption IS 
  'Records promotion redemption and updates redemption count atomically.';

COMMENT ON TABLE public.promotion_redemptions IS 
  'Tracks which promotions were applied to transactions. Enables analytics and prevents duplicate application.';

COMMIT;
