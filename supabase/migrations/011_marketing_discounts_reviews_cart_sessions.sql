-- Migration: Marketing automation primitives (discounts, reviews, cart sessions, usage alerts)
-- NOTE: This app uses Clerk (not Supabase Auth). RLS is enabled with NO policies.
-- Server routes use service-role key and bypass RLS.

BEGIN;

-- ----------------------------------------------------------------------------
-- 1) Activation details: cache usage fetch metadata for UI + rate limiting
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.activation_details
  ADD COLUMN IF NOT EXISTS usage_refreshed_at timestamptz,
  ADD COLUMN IF NOT EXISTS usage_last_update_time text;

CREATE INDEX IF NOT EXISTS idx_activation_details_usage_refreshed_at
  ON public.activation_details(usage_refreshed_at);

-- ----------------------------------------------------------------------------
-- 2) Discount codes (single-use) + reservations + redemptions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  percent_off integer NOT NULL CHECK (percent_off >= 1 AND percent_off <= 90),
  applies_to text NOT NULL DEFAULT 'any', -- any | esim | cart | topup
  created_reason text,
  created_for_transaction_id text,
  created_for_email text,
  max_redemptions integer NOT NULL DEFAULT 1 CHECK (max_redemptions >= 1),
  redeemed_count integer NOT NULL DEFAULT 0 CHECK (redeemed_count >= 0),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON public.discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_created_for_email ON public.discount_codes(created_for_email);
CREATE INDEX IF NOT EXISTS idx_discount_codes_expires_at ON public.discount_codes(expires_at);

CREATE TRIGGER update_discount_codes_updated_at BEFORE UPDATE ON public.discount_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- One active reservation per discount code (prevents double-spend at checkout).
CREATE TABLE IF NOT EXISTS public.discount_reservations (
  discount_code_id uuid PRIMARY KEY REFERENCES public.discount_codes(id) ON DELETE CASCADE,
  payment_intent_id text UNIQUE NOT NULL,
  customer_email text,
  reserved_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  context jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discount_reservations_expires_at ON public.discount_reservations(expires_at);
CREATE INDEX IF NOT EXISTS idx_discount_reservations_customer_email ON public.discount_reservations(customer_email);

CREATE TABLE IF NOT EXISTS public.discount_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_code_id uuid NOT NULL REFERENCES public.discount_codes(id) ON DELETE CASCADE,
  payment_intent_id text UNIQUE NOT NULL,
  customer_email text,
  transaction_id text,
  redeemed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discount_redemptions_discount_code_id ON public.discount_redemptions(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_redemptions_customer_email ON public.discount_redemptions(customer_email);
CREATE INDEX IF NOT EXISTS idx_discount_redemptions_transaction_id ON public.discount_redemptions(transaction_id);

-- ----------------------------------------------------------------------------
-- 3) Usage alert dedupe + discount issuance tracking
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usage_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text NOT NULL,
  alert_type text NOT NULL, -- low_data | validity | etc
  threshold_label text, -- e.g. "10%" or "0.1"
  email_id text,
  discount_code_id uuid REFERENCES public.discount_codes(id) ON DELETE SET NULL,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Dedupe: only one alert per transaction + type + threshold
CREATE UNIQUE INDEX IF NOT EXISTS uq_usage_alerts_dedupe
  ON public.usage_alerts(transaction_id, alert_type, COALESCE(threshold_label, ''));

CREATE INDEX IF NOT EXISTS idx_usage_alerts_transaction_id ON public.usage_alerts(transaction_id);
CREATE INDEX IF NOT EXISTS idx_usage_alerts_sent_at ON public.usage_alerts(sent_at);

-- ----------------------------------------------------------------------------
-- 4) Cart sessions (abandonment reminders + restore token)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cart_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  email text NOT NULL,
  items jsonb NOT NULL, -- [{offerId, name?, priceLabel?, quantity}]
  currency text,
  converted_at timestamptz,
  checkout_started_at timestamptz,
  stripe_payment_intent_id text,
  reminder1_scheduled_at timestamptz,
  reminder1_email_id text,
  reminder1_cancelled_at timestamptz,
  reminder2_scheduled_at timestamptz,
  reminder2_email_id text,
  reminder2_cancelled_at timestamptz,
  last_error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cart_sessions_email ON public.cart_sessions(email);
CREATE INDEX IF NOT EXISTS idx_cart_sessions_converted_at ON public.cart_sessions(converted_at);
CREATE INDEX IF NOT EXISTS idx_cart_sessions_created_at ON public.cart_sessions(created_at);

CREATE TRIGGER update_cart_sessions_updated_at BEFORE UPDATE ON public.cart_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 5) Reviews (moderation-ready)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text NOT NULL,
  user_id text NOT NULL, -- Clerk user id
  email text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_reviews_transaction_user
  ON public.reviews(transaction_id, user_id);

CREATE INDEX IF NOT EXISTS idx_reviews_transaction_id ON public.reviews(transaction_id);
CREATE INDEX IF NOT EXISTS idx_reviews_published ON public.reviews(published);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 6) RLS lockdown (no policies)
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.discount_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.discount_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.usage_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cart_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;

COMMIT;

