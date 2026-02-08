-- =============================================================================
-- Migration: Post-purchase retention / lifecycle data foundation
-- =============================================================================
--
-- Purpose: Support lifecycle marketing (e.g. "Travelling again?" emails) without
-- integrating an email system yet. Data only.
--
-- Design:
--   - customer_lifecycle: one row per customer (email). Captures first/last
--     purchase time, purchase count, and destination/trip tags. Upserted when
--     a purchase succeeds so we "capture email after purchase" and tag by
--     destination in one place.
--   - esim_purchases: add destination_country and trip_type so each purchase
--     is tagged (app can set these when recording the purchase; trigger can
--     infer trip_type from product_name if not set).
--   - View customer_lifecycle_reactivation: ready for future "Travelling again?"
--     campaigns (email, last_purchase_at, trip_type, days_since_purchase).
--
-- No email sending or templates; structure only.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Tag purchases by destination (optional; app can set at write time)
-- -----------------------------------------------------------------------------
-- destination_country: e.g. 'SA' for Saudi Arabia. Default SA for this product.
-- trip_type: umrah | hajj | general — for segmenting "Travelling again?" by trip.
ALTER TABLE esim_purchases
  ADD COLUMN IF NOT EXISTS destination_country text DEFAULT 'SA',
  ADD COLUMN IF NOT EXISTS trip_type text DEFAULT 'general'
    CHECK (trip_type IN ('umrah', 'hajj', 'general'));

CREATE INDEX IF NOT EXISTS idx_esim_purchases_destination_country ON esim_purchases(destination_country);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_trip_type ON esim_purchases(trip_type);

COMMENT ON COLUMN esim_purchases.destination_country IS 'Destination country (e.g. SA). Set at purchase; used for lifecycle tagging.';
COMMENT ON COLUMN esim_purchases.trip_type IS 'Trip intent: umrah, hajj, or general. Set at purchase or inferred from product_name.';

-- -----------------------------------------------------------------------------
-- 2. Infer trip_type from product_name when not set (for backfill/consistency)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION infer_trip_type_from_product(p_product_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_product_name IS NULL THEN 'general'
    WHEN lower(p_product_name) ~ 'umrah' THEN 'umrah'
    WHEN lower(p_product_name) ~ 'hajj'  THEN 'hajj'
    ELSE 'general'
  END;
$$;

COMMENT ON FUNCTION infer_trip_type_from_product IS 'Derives trip_type from product_name for lifecycle tagging when app does not set it.';

-- -----------------------------------------------------------------------------
-- 3. Customer lifecycle table (one row per email; post-purchase capture + tags)
-- -----------------------------------------------------------------------------
-- Email is normalized (lowercase). Updated on every successful purchase so we
-- always have latest last_purchase_at and can tag by destination/trip_type.
CREATE TABLE IF NOT EXISTS customer_lifecycle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_purchase_at timestamptz NOT NULL,
  last_purchase_at timestamptz NOT NULL,
  purchase_count int NOT NULL DEFAULT 1 CHECK (purchase_count >= 1),
  destination_country text NOT NULL DEFAULT 'SA',
  trip_type text NOT NULL DEFAULT 'general'
    CHECK (trip_type IN ('umrah', 'hajj', 'general')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_customer_lifecycle_email UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_customer_lifecycle_email ON customer_lifecycle(email);
CREATE INDEX IF NOT EXISTS idx_customer_lifecycle_last_purchase_at ON customer_lifecycle(last_purchase_at);
CREATE INDEX IF NOT EXISTS idx_customer_lifecycle_trip_type ON customer_lifecycle(trip_type);
CREATE INDEX IF NOT EXISTS idx_customer_lifecycle_destination_country ON customer_lifecycle(destination_country);

COMMENT ON TABLE customer_lifecycle IS 'One row per customer (email). Post-purchase capture + destination/trip tags for lifecycle marketing.';
COMMENT ON COLUMN customer_lifecycle.trip_type IS 'Last trip type (umrah/hajj/general) for segmenting e.g. Travelling again? emails.';

-- -----------------------------------------------------------------------------
-- 4. Upsert lifecycle row when a purchase succeeds (capture email + tag)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION customer_lifecycle_upsert_on_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_email text;
  v_dest text;
  v_trip text;
  v_created_at timestamptz;
BEGIN
  -- Only run when we have a successful payment and an email
  IF NEW.customer_email IS NULL OR trim(NEW.customer_email) = '' THEN
    RETURN NEW;
  END IF;
  IF NEW.stripe_payment_status IS DISTINCT FROM 'succeeded' AND NEW.stripe_payment_status IS DISTINCT FROM 'paid' THEN
    RETURN NEW;
  END IF;

  v_email := lower(trim(NEW.customer_email));
  v_created_at := COALESCE(NEW.created_at, now());
  v_dest := COALESCE(NULLIF(trim(NEW.destination_country), ''), 'SA');
  v_trip := COALESCE(NULLIF(trim(NEW.trip_type), ''), infer_trip_type_from_product(NEW.product_name));

  INSERT INTO customer_lifecycle (
    email,
    first_purchase_at,
    last_purchase_at,
    purchase_count,
    destination_country,
    trip_type,
    updated_at
  )
  SELECT
    v_email,
    v_created_at,
    v_created_at,
    (SELECT count(*)::int FROM esim_purchases ep
     WHERE lower(trim(ep.customer_email)) = v_email
       AND ep.stripe_payment_status IN ('succeeded', 'paid')),
    v_dest,
    v_trip,
    now()
  ON CONFLICT (email) DO UPDATE SET
    last_purchase_at = GREATEST(customer_lifecycle.last_purchase_at, v_created_at),
    first_purchase_at = LEAST(customer_lifecycle.first_purchase_at, v_created_at),
    purchase_count = (SELECT count(*)::int FROM esim_purchases ep
                     WHERE lower(trim(ep.customer_email)) = v_email
                       AND ep.stripe_payment_status IN ('succeeded', 'paid')),
    destination_country = v_dest,
    trip_type = v_trip,
    updated_at = now();

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION customer_lifecycle_upsert_on_purchase IS 'Upserts customer_lifecycle when a purchase succeeds: capture email, tag by destination/trip_type.';

DROP TRIGGER IF EXISTS trigger_customer_lifecycle_on_purchase ON esim_purchases;
CREATE TRIGGER trigger_customer_lifecycle_on_purchase
  AFTER INSERT OR UPDATE OF customer_email, stripe_payment_status, created_at, destination_country, trip_type, product_name
  ON esim_purchases
  FOR EACH ROW
  EXECUTE FUNCTION customer_lifecycle_upsert_on_purchase();

-- -----------------------------------------------------------------------------
-- 5. updated_at trigger for customer_lifecycle
-- -----------------------------------------------------------------------------
CREATE TRIGGER update_customer_lifecycle_updated_at
  BEFORE UPDATE ON customer_lifecycle
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 6. View: ready for "Travelling again?" campaigns (no email sent here)
-- -----------------------------------------------------------------------------
-- Filter by days_since_purchase in the app (e.g. > 90 or > 180) for reactivation.
CREATE OR REPLACE VIEW customer_lifecycle_reactivation AS
SELECT
  email,
  first_purchase_at,
  last_purchase_at,
  trip_type,
  destination_country,
  purchase_count,
  (current_date - (last_purchase_at AT TIME ZONE 'UTC')::date)::int AS days_since_purchase
FROM customer_lifecycle;

COMMENT ON VIEW customer_lifecycle_reactivation IS 'For future Travelling again? emails: segment by trip_type and filter by days_since_purchase.';

-- -----------------------------------------------------------------------------
-- 7. RLS (no policies = service role only)
-- -----------------------------------------------------------------------------
ALTER TABLE customer_lifecycle ENABLE ROW LEVEL SECURITY;

COMMIT;
