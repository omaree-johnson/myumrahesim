-- =============================================================================
-- Migration: Basic affiliate system
-- =============================================================================
--
-- Design:
--   - affiliates: signup table; each row has a unique referral_code (used in
--     links like /plans?ref=CODE). Commission rate is per-affiliate.
--   - esim_purchases.affiliate_id: links a purchase to the referring affiliate
--     when the customer used that affiliate's ref code at checkout.
--   - affiliate_commissions: one row per referred purchase; stores computed
--     commission (no payouts yet). Extensible with paid_at / payout_batch_id later.
--   - Commission is calculated as order_amount * (commission_rate_pct / 100).
--     Calculation is in a DB function and in the view for admin reporting.
--   - affiliate_admin_summary: view for admins (totals per affiliate).
--
-- Usage:
--   - Referral link: base_url/plans?ref=REFERRAL_CODE (e.g. ?ref=JOHN2025).
--   - At checkout, resolve ref param to affiliate_id (SELECT id FROM affiliates
--     WHERE referral_code = UPPER(:code) AND status = 'active') and set
--     esim_purchases.affiliate_id when creating the purchase.
--   - Commission rows are created by trigger on successful payment, or insert
--     manually into affiliate_commissions. Admin dashboard: SELECT * FROM affiliate_admin_summary.
--
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Affiliate signup table
-- -----------------------------------------------------------------------------
-- referral_code: unique, URL-safe (e.g. JOHN2025). Used in ?ref= and referral links.
-- commission_rate_pct: default 10 = 10%. Can override per affiliate.
-- status: active (can accrue), paused (no new referrals), removed (soft delete).
CREATE TABLE IF NOT EXISTS affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  referral_code text NOT NULL,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'removed')),
  commission_rate_pct numeric(5,2) NOT NULL DEFAULT 10
    CHECK (commission_rate_pct >= 0 AND commission_rate_pct <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_affiliates_referral_code UNIQUE (referral_code)
);

CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);
CREATE INDEX IF NOT EXISTS idx_affiliates_email ON affiliates(email);

COMMENT ON TABLE affiliates IS 'Affiliate signups; each has a unique referral code for links (?ref=CODE).';
COMMENT ON COLUMN affiliates.referral_code IS 'Unique code for referral links, e.g. /plans?ref=JOHN2025.';
COMMENT ON COLUMN affiliates.commission_rate_pct IS 'Commission as % of order amount (e.g. 10 = 10%).';

-- -----------------------------------------------------------------------------
-- 2. Link purchases to affiliate (track by referral)
-- -----------------------------------------------------------------------------
ALTER TABLE esim_purchases
  ADD COLUMN IF NOT EXISTS affiliate_id uuid REFERENCES affiliates(id);

CREATE INDEX IF NOT EXISTS idx_esim_purchases_affiliate_id ON esim_purchases(affiliate_id);

COMMENT ON COLUMN esim_purchases.affiliate_id IS 'Set when customer used this affiliate referral code at checkout.';

-- -----------------------------------------------------------------------------
-- 3. Commission calculation function (single place for logic)
-- -----------------------------------------------------------------------------
-- Order amount in smallest currency unit (cents). Returns commission in same unit.
CREATE OR REPLACE FUNCTION affiliate_commission_cents(
  order_amount_cents bigint,
  commission_rate_pct numeric
) RETURNS bigint
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (order_amount_cents * commission_rate_pct / 100)::bigint;
$$;

COMMENT ON FUNCTION affiliate_commission_cents IS 'Commission = order_amount_cents * (rate_pct / 100). No payouts yet.';

-- -----------------------------------------------------------------------------
-- 4. Commission records (one per referred purchase; payout-ready later)
-- -----------------------------------------------------------------------------
-- Application should insert a row here when a purchase with affiliate_id succeeds.
-- status: pending (default), approved, paid, reversed. Later add paid_at, payout_batch_id.
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES affiliates(id) ON DELETE RESTRICT,
  esim_purchase_id uuid NOT NULL REFERENCES esim_purchases(id) ON DELETE RESTRICT,
  order_amount_cents bigint NOT NULL CHECK (order_amount_cents >= 0),
  commission_rate_pct numeric(5,2) NOT NULL,
  commission_amount_cents bigint NOT NULL CHECK (commission_amount_cents >= 0),
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid', 'reversed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_affiliate_commissions_esim_purchase UNIQUE (esim_purchase_id)
);

CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate_id ON affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_status ON affiliate_commissions(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_created_at ON affiliate_commissions(created_at);

COMMENT ON TABLE affiliate_commissions IS 'One row per referred purchase; commission stored for audit and future payouts.';

-- -----------------------------------------------------------------------------
-- 5. Admin-viewable summary (aggregates per affiliate)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW affiliate_admin_summary AS
SELECT
  a.id AS affiliate_id,
  a.email,
  a.name,
  a.referral_code,
  a.status,
  a.commission_rate_pct,
  a.created_at,
  COALESCE(SUM(ac.order_amount_cents), 0)::bigint AS total_sales_cents,
  COALESCE(SUM(ac.commission_amount_cents), 0)::bigint AS total_commission_cents,
  COUNT(ac.id)::int AS referred_purchase_count
FROM affiliates a
LEFT JOIN affiliate_commissions ac ON ac.affiliate_id = a.id AND ac.status <> 'reversed'
GROUP BY a.id, a.email, a.name, a.referral_code, a.status, a.commission_rate_pct, a.created_at;

COMMENT ON VIEW affiliate_admin_summary IS 'Admin summary: totals and count per affiliate. Use total_sales_cents/100 for display.';

-- -----------------------------------------------------------------------------
-- 6. updated_at trigger for affiliates
-- -----------------------------------------------------------------------------
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON affiliates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 7. Optional: auto-create commission row when purchase succeeds with referral
-- -----------------------------------------------------------------------------
-- When esim_purchases has affiliate_id and payment succeeded, ensure one
-- affiliate_commissions row exists. App can also insert explicitly.
CREATE OR REPLACE FUNCTION affiliate_commission_on_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.affiliate_id IS NOT NULL
     AND (NEW.stripe_payment_status = 'succeeded' OR NEW.stripe_payment_status = 'paid')
     AND NEW.price IS NOT NULL
     AND NEW.price > 0
  THEN
    INSERT INTO affiliate_commissions (
      affiliate_id,
      esim_purchase_id,
      order_amount_cents,
      commission_rate_pct,
      commission_amount_cents,
      currency,
      status
    )
    SELECT
      NEW.affiliate_id,
      NEW.id,
      NEW.price,
      a.commission_rate_pct,
      affiliate_commission_cents(NEW.price::bigint, a.commission_rate_pct),
      COALESCE(NEW.currency, 'USD'),
      'pending'
    FROM affiliates a
    WHERE a.id = NEW.affiliate_id
      AND a.status = 'active'
      AND NOT EXISTS (
        SELECT 1 FROM affiliate_commissions ac WHERE ac.esim_purchase_id = NEW.id
      );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_affiliate_commission_on_purchase
  AFTER INSERT OR UPDATE OF affiliate_id, stripe_payment_status, price
  ON esim_purchases
  FOR EACH ROW
  EXECUTE FUNCTION affiliate_commission_on_purchase();

COMMENT ON FUNCTION affiliate_commission_on_purchase IS 'Creates one affiliate_commissions row when a purchase succeeds with affiliate_id (idempotent).';

-- -----------------------------------------------------------------------------
-- 8. RLS (no policies = service role only, same as other app tables)
-- -----------------------------------------------------------------------------
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;

COMMIT;
