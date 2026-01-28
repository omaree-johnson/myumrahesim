-- ============================================================================
-- COMPLETE SUPABASE SCHEMA FOR eSIM APPLICATION
-- ============================================================================
-- This script creates ALL tables, indexes, triggers, views, and RLS policies
-- needed for the My Umrah eSIM application.
--
-- USAGE:
-- 1. Open Supabase Dashboard > SQL Editor
-- 2. Copy and paste this ENTIRE script
-- 3. Click "Run" to execute
--
-- IMPORTANT: This script is idempotent - safe to run multiple times.
-- It uses IF NOT EXISTS checks to avoid errors on re-runs.
-- ============================================================================

BEGIN;

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 001: CORE TABLES (customers, purchases, activation_details)
-- ============================================================================

-- Customers table - stores user account information
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  clerk_user_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchases table (legacy - kept for backward compatibility)
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT UNIQUE NOT NULL,
  offer_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'DONE', 'FAILED')),
  price_amount NUMERIC NOT NULL,
  price_currency TEXT NOT NULL,
  zendit_response JSONB,
  user_id UUID REFERENCES customers(id),
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  order_no TEXT,
  esim_provider_response JSONB,
  esim_provider_status TEXT,
  esim_provider_cost INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activation details table - stores QR codes, SM-DP+ addresses, ICCID, etc.
CREATE TABLE IF NOT EXISTS activation_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT UNIQUE NOT NULL, -- Links to both purchases and esim_purchases
  qr_code_url TEXT,
  smdp_address TEXT,
  activation_code TEXT,
  iccid TEXT,
  confirmation_data JSONB,
  esim_tran_no TEXT,
  order_no TEXT,
  universal_link TEXT,
  qr_code TEXT,
  activation_status TEXT DEFAULT 'pending',
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  data_used BIGINT,
  data_limit BIGINT,
  usage_refreshed_at TIMESTAMPTZ,
  usage_last_update_time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 002: esim_purchases TABLE (Primary purchase table)
-- ============================================================================

-- Main eSIM purchases table - stores all purchase data
CREATE TABLE IF NOT EXISTS esim_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- User identification (can be Clerk user ID, customer UUID as text, or 'anonymous')
  user_id TEXT, -- Stores Clerk user_id, customer.id (UUID as text), or 'anonymous' (nullable)
  -- Customer information
  customer_email TEXT,
  customer_name TEXT,
  -- Product information
  offer_id TEXT NOT NULL,
  package_code TEXT,
  product_name TEXT,
  -- Pricing
  price INTEGER NOT NULL, -- Price in cents (smallest currency unit)
  currency TEXT NOT NULL DEFAULT 'USD',
  esim_provider_cost INTEGER, -- Provider cost in cents
  -- Transaction tracking
  transaction_id TEXT UNIQUE NOT NULL, -- Our unique transaction ID
  order_no TEXT, -- Provider order number
  esim_tran_no TEXT, -- Provider transaction number
  -- Stripe payment information
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  stripe_payment_status TEXT,
  stripe_issuing_card_id TEXT,
  payment_method TEXT,
  payment_method_details JSONB,
  -- Provider status and response
  esim_provider_status TEXT DEFAULT 'PENDING', -- PENDING, PROCESSING, GOT_RESOURCE, IN_USE, FAILED, etc.
  esim_provider_response JSONB, -- Full provider API response
  esim_provider_error_code TEXT,
  esim_provider_error_message TEXT,
  -- Refund information
  refund_status TEXT,
  refund_amount INTEGER,
  refund_reason TEXT,
  -- Additional data
  confirmation JSONB, -- Confirmation data from provider
  qr_code_url TEXT, -- Legacy field
  webhook_event_id TEXT,
  notes TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 003: TRACKING AND AUDIT TABLES
-- ============================================================================

-- Webhook events - logs all incoming webhooks
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL, -- 'stripe', 'esimaccess', etc.
  transaction_id TEXT,
  order_no TEXT,
  esim_tran_no TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processing_error TEXT,
  processing_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment actions - tracks payment lifecycle events
CREATE TABLE IF NOT EXISTS payment_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT NOT NULL,
  payment_intent_id TEXT,
  action_type TEXT NOT NULL, -- 'created', 'confirmed', 'succeeded', 'refunded', etc.
  action_status TEXT NOT NULL,
  amount INTEGER,
  currency TEXT,
  metadata JSONB,
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- eSIM actions - tracks eSIM provider API calls
CREATE TABLE IF NOT EXISTS esim_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT,
  order_no TEXT,
  esim_tran_no TEXT,
  action_type TEXT NOT NULL, -- 'order_created', 'activation_ready', etc.
  action_status TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'esimaccess', etc.
  provider_response JSONB,
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email events - tracks all email sends
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT,
  order_no TEXT,
  email_type TEXT NOT NULL, -- 'order_confirmation', 'activation', etc.
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT,
  email_provider TEXT, -- 'resend', etc.
  email_provider_id TEXT,
  status TEXT NOT NULL, -- 'sent', 'delivered', 'failed', etc.
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 004: TOP-UP TABLES
-- ============================================================================

-- eSIM top-ups - stores top-up orders for existing eSIMs
CREATE TABLE IF NOT EXISTS esim_topups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user id or 'anonymous'
  customer_email TEXT,
  customer_name TEXT,
  iccid TEXT NOT NULL, -- ICCID of the eSIM to top up
  package_code TEXT NOT NULL, -- Top-up package code
  price INTEGER NOT NULL, -- Selling price in cents
  currency TEXT NOT NULL DEFAULT 'USD',
  esim_provider_cost INTEGER, -- Provider cost in cents
  transaction_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_payment_status TEXT,
  payment_method TEXT,
  payment_method_details JSONB,
  esim_provider_status TEXT DEFAULT 'pending',
  esim_provider_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 005: MARKETING AND ENGAGEMENT TABLES
-- ============================================================================

-- Discount codes - single-use discount codes
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  percent_off INTEGER NOT NULL CHECK (percent_off >= 1 AND percent_off <= 90),
  applies_to TEXT NOT NULL DEFAULT 'any', -- 'any' | 'esim' | 'cart' | 'topup'
  created_reason TEXT,
  created_for_transaction_id TEXT,
  created_for_email TEXT,
  max_redemptions INTEGER NOT NULL DEFAULT 1 CHECK (max_redemptions >= 1),
  redeemed_count INTEGER NOT NULL DEFAULT 0 CHECK (redeemed_count >= 0),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discount reservations - prevents double-spend during checkout
CREATE TABLE IF NOT EXISTS discount_reservations (
  discount_code_id UUID PRIMARY KEY REFERENCES discount_codes(id) ON DELETE CASCADE,
  payment_intent_id TEXT UNIQUE NOT NULL,
  customer_email TEXT,
  reserved_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discount redemptions - tracks actual discount usage
CREATE TABLE IF NOT EXISTS discount_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_code_id UUID NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
  payment_intent_id TEXT UNIQUE NOT NULL,
  customer_email TEXT,
  transaction_id TEXT,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage alerts - tracks low data/expiration alerts sent to customers
CREATE TABLE IF NOT EXISTS usage_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT NOT NULL,
  alert_type TEXT NOT NULL, -- 'low_data', 'validity', etc.
  threshold_label TEXT, -- e.g. "10%" or "0.1"
  email_id TEXT,
  discount_code_id UUID REFERENCES discount_codes(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart sessions - tracks abandoned carts for reminder emails
CREATE TABLE IF NOT EXISTS cart_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL, -- Restore token
  email TEXT NOT NULL,
  items JSONB NOT NULL, -- [{offerId, name?, priceLabel?, quantity}]
  currency TEXT,
  converted_at TIMESTAMPTZ, -- When cart was converted to purchase
  checkout_started_at TIMESTAMPTZ,
  stripe_payment_intent_id TEXT,
  reminder1_scheduled_at TIMESTAMPTZ,
  reminder1_email_id TEXT,
  reminder1_cancelled_at TIMESTAMPTZ,
  reminder2_scheduled_at TIMESTAMPTZ,
  reminder2_email_id TEXT,
  reminder2_cancelled_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews - customer reviews with moderation support
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT NOT NULL,
  user_id TEXT NOT NULL, -- Clerk user id
  email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  published BOOLEAN NOT NULL DEFAULT false, -- Moderation flag
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- One review per transaction per user
  UNIQUE(transaction_id, user_id)
);

-- ============================================================================
-- 005: OPTIONAL TABLES
-- ============================================================================

-- Issuing cards (if using Stripe Issuing - currently not used)
CREATE TABLE IF NOT EXISTS issuing_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id TEXT UNIQUE, -- Stripe issuing card id
  card_last4 TEXT,
  card_exp TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_clerk_user_id ON customers(clerk_user_id);

-- Purchases indexes
CREATE INDEX IF NOT EXISTS idx_purchases_transaction_id ON purchases(transaction_id);
CREATE INDEX IF NOT EXISTS idx_purchases_customer_email ON purchases(customer_email);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_session_id ON purchases(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_payment_intent ON purchases(stripe_payment_intent);
CREATE INDEX IF NOT EXISTS idx_purchases_order_no ON purchases(order_no);
CREATE INDEX IF NOT EXISTS idx_purchases_esim_provider_status ON purchases(esim_provider_status);

-- Activation details indexes
CREATE INDEX IF NOT EXISTS idx_activation_details_transaction_id ON activation_details(transaction_id);
CREATE INDEX IF NOT EXISTS idx_activation_details_esim_tran_no ON activation_details(esim_tran_no);
CREATE INDEX IF NOT EXISTS idx_activation_details_order_no ON activation_details(order_no);
CREATE INDEX IF NOT EXISTS idx_activation_details_activation_status ON activation_details(activation_status);
CREATE INDEX IF NOT EXISTS idx_activation_details_iccid ON activation_details(iccid);
CREATE INDEX IF NOT EXISTS idx_activation_details_usage_refreshed_at ON activation_details(usage_refreshed_at);

-- esim_purchases indexes
CREATE INDEX IF NOT EXISTS idx_esim_purchases_user_id ON esim_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_transaction_id ON esim_purchases(transaction_id);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_customer_email ON esim_purchases(customer_email);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_stripe_payment_intent_id ON esim_purchases(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_order_no ON esim_purchases(order_no);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_esim_tran_no ON esim_purchases(esim_tran_no);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_esim_provider_status ON esim_purchases(esim_provider_status);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_package_code ON esim_purchases(package_code);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_created_at ON esim_purchases(created_at);

-- Webhook events indexes
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_source ON webhook_events(source);
CREATE INDEX IF NOT EXISTS idx_webhook_events_transaction_id ON webhook_events(transaction_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_order_no ON webhook_events(order_no);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);

-- Payment actions indexes
CREATE INDEX IF NOT EXISTS idx_payment_actions_transaction_id ON payment_actions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_actions_payment_intent_id ON payment_actions(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_actions_action_type ON payment_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_payment_actions_created_at ON payment_actions(created_at);

-- eSIM actions indexes
CREATE INDEX IF NOT EXISTS idx_esim_actions_transaction_id ON esim_actions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_esim_actions_order_no ON esim_actions(order_no);
CREATE INDEX IF NOT EXISTS idx_esim_actions_esim_tran_no ON esim_actions(esim_tran_no);
CREATE INDEX IF NOT EXISTS idx_esim_actions_provider ON esim_actions(provider);
CREATE INDEX IF NOT EXISTS idx_esim_actions_created_at ON esim_actions(created_at);

-- Email events indexes
CREATE INDEX IF NOT EXISTS idx_email_events_transaction_id ON email_events(transaction_id);
CREATE INDEX IF NOT EXISTS idx_email_events_order_no ON email_events(order_no);
CREATE INDEX IF NOT EXISTS idx_email_events_email_type ON email_events(email_type);
CREATE INDEX IF NOT EXISTS idx_email_events_recipient_email ON email_events(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_events_status ON email_events(status);
CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON email_events(created_at);

-- Top-ups indexes
CREATE INDEX IF NOT EXISTS idx_esim_topups_customer_email ON esim_topups(customer_email);
CREATE INDEX IF NOT EXISTS idx_esim_topups_iccid ON esim_topups(iccid);
CREATE INDEX IF NOT EXISTS idx_esim_topups_transaction_id ON esim_topups(transaction_id);
CREATE INDEX IF NOT EXISTS idx_esim_topups_payment_intent_id ON esim_topups(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_esim_topups_created_at ON esim_topups(created_at);

-- Discount codes indexes
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_created_for_email ON discount_codes(created_for_email);
CREATE INDEX IF NOT EXISTS idx_discount_codes_expires_at ON discount_codes(expires_at);

-- Discount reservations indexes
CREATE INDEX IF NOT EXISTS idx_discount_reservations_expires_at ON discount_reservations(expires_at);
CREATE INDEX IF NOT EXISTS idx_discount_reservations_customer_email ON discount_reservations(customer_email);

-- Discount redemptions indexes
CREATE INDEX IF NOT EXISTS idx_discount_redemptions_discount_code_id ON discount_redemptions(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_redemptions_customer_email ON discount_redemptions(customer_email);
CREATE INDEX IF NOT EXISTS idx_discount_redemptions_transaction_id ON discount_redemptions(transaction_id);

-- Usage alerts indexes
CREATE INDEX IF NOT EXISTS idx_usage_alerts_transaction_id ON usage_alerts(transaction_id);
CREATE INDEX IF NOT EXISTS idx_usage_alerts_sent_at ON usage_alerts(sent_at);

-- Unique index to prevent duplicate alerts (handles NULL threshold_label)
-- This ensures only one alert per transaction + type + threshold combination
CREATE UNIQUE INDEX IF NOT EXISTS uq_usage_alerts_dedupe 
  ON usage_alerts(transaction_id, alert_type, COALESCE(threshold_label, ''));

-- Cart sessions indexes
CREATE INDEX IF NOT EXISTS idx_cart_sessions_email ON cart_sessions(email);
CREATE INDEX IF NOT EXISTS idx_cart_sessions_converted_at ON cart_sessions(converted_at);
CREATE INDEX IF NOT EXISTS idx_cart_sessions_created_at ON cart_sessions(created_at);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_transaction_id ON reviews(transaction_id);
CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews(published);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Issuing cards indexes
CREATE INDEX IF NOT EXISTS idx_issuing_cards_card_id ON issuing_cards(card_id);
CREATE INDEX IF NOT EXISTS idx_issuing_cards_active ON issuing_cards(active);

-- ============================================================================
-- TRIGGERS FOR updated_at AUTOMATIC UPDATES
-- ============================================================================

-- Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for all tables with updated_at (with existence checks)
DO $$
BEGIN
  -- Core tables
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_customers_updated_at') THEN
    CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_purchases_updated_at') THEN
    CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_activation_details_updated_at') THEN
    CREATE TRIGGER update_activation_details_updated_at BEFORE UPDATE ON activation_details
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_esim_purchases_updated_at') THEN
    CREATE TRIGGER update_esim_purchases_updated_at BEFORE UPDATE ON esim_purchases
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Tracking tables
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_webhook_events_updated_at') THEN
    CREATE TRIGGER update_webhook_events_updated_at BEFORE UPDATE ON webhook_events
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_payment_actions_updated_at') THEN
    CREATE TRIGGER update_payment_actions_updated_at BEFORE UPDATE ON payment_actions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_esim_actions_updated_at') THEN
    CREATE TRIGGER update_esim_actions_updated_at BEFORE UPDATE ON esim_actions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_email_events_updated_at') THEN
    CREATE TRIGGER update_email_events_updated_at BEFORE UPDATE ON email_events
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Top-ups
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_esim_topups_updated_at') THEN
    CREATE TRIGGER update_esim_topups_updated_at BEFORE UPDATE ON esim_topups
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Marketing tables
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_discount_codes_updated_at') THEN
    CREATE TRIGGER update_discount_codes_updated_at BEFORE UPDATE ON discount_codes
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cart_sessions_updated_at') THEN
    CREATE TRIGGER update_cart_sessions_updated_at BEFORE UPDATE ON cart_sessions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reviews_updated_at') THEN
    CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Purchase details view - combines esim_purchases with activation_details
CREATE OR REPLACE VIEW purchase_details AS
SELECT 
  ep.id,
  ep.transaction_id,
  ep.user_id,
  ep.offer_id,
  ep.package_code,
  ep.product_name,
  ep.price,
  ep.currency,
  ep.customer_email,
  ep.customer_name,
  ep.stripe_payment_intent_id,
  ep.stripe_payment_status,
  ep.order_no,
  ep.esim_tran_no,
  ep.esim_provider_status,
  ep.esim_provider_cost,
  ep.esim_provider_error_code,
  ep.esim_provider_error_message,
  ep.refund_status,
  ep.refund_amount,
  ep.created_at,
  ep.updated_at,
  ad.smdp_address,
  ad.activation_code,
  ad.iccid,
  ad.universal_link,
  ad.qr_code,
  ad.activation_status,
  ad.activated_at,
  ad.expires_at
FROM esim_purchases ep
LEFT JOIN activation_details ad ON ep.transaction_id = ad.transaction_id;

-- Payment actions summary view
CREATE OR REPLACE VIEW payment_actions_summary AS
SELECT 
  transaction_id,
  payment_intent_id,
  COUNT(*) as total_actions,
  MAX(CASE WHEN action_type = 'created' THEN created_at END) as created_at,
  MAX(CASE WHEN action_type = 'confirmed' THEN created_at END) as confirmed_at,
  MAX(CASE WHEN action_type = 'succeeded' THEN created_at END) as succeeded_at,
  MAX(CASE WHEN action_type = 'refunded' THEN created_at END) as refunded_at,
  MAX(created_at) as last_action_at
FROM payment_actions
GROUP BY transaction_id, payment_intent_id;

-- eSIM actions timeline view
CREATE OR REPLACE VIEW esim_actions_timeline AS
SELECT 
  transaction_id,
  order_no,
  esim_tran_no,
  provider,
  COUNT(*) as total_actions,
  MAX(CASE WHEN action_type = 'order_created' THEN created_at END) as order_created_at,
  MAX(CASE WHEN action_type = 'activation_ready' THEN created_at END) as activation_ready_at,
  MAX(CASE WHEN action_type = 'activation_sent' THEN created_at END) as activation_sent_at,
  MAX(created_at) as last_action_at
FROM esim_actions
GROUP BY transaction_id, order_no, esim_tran_no, provider;

-- Email delivery status view
CREATE OR REPLACE VIEW email_delivery_status AS
SELECT 
  transaction_id,
  order_no,
  email_type,
  recipient_email,
  status,
  sent_at,
  delivered_at,
  opened_at,
  clicked_at,
  error_message,
  created_at
FROM email_events
ORDER BY created_at DESC;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) ENABLEMENT
-- ============================================================================
-- Note: RLS is enabled but no policies are created here.
-- The application uses service role key for server-side operations,
-- which bypasses RLS. If you need user-facing policies, add them separately.

-- Core tables
ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activation_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS esim_purchases ENABLE ROW LEVEL SECURITY;

-- Tracking tables
ALTER TABLE IF EXISTS webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS esim_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS email_events ENABLE ROW LEVEL SECURITY;

-- Top-ups
ALTER TABLE IF EXISTS esim_topups ENABLE ROW LEVEL SECURITY;

-- Marketing tables
ALTER TABLE IF EXISTS discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS discount_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS discount_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS usage_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cart_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;

-- Optional tables
ALTER TABLE IF EXISTS issuing_cards ENABLE ROW LEVEL SECURITY;

COMMIT;

-- ============================================================================
-- SCHEMA CREATION COMPLETE
-- ============================================================================
-- All tables, indexes, triggers, views, and RLS have been created.
-- 
-- NEXT STEPS:
-- 1. Verify all tables were created: Check Supabase Dashboard > Table Editor
-- 2. Set up environment variables in your .env.local:
--    - NEXT_PUBLIC_SUPABASE_URL
--    - NEXT_PUBLIC_SUPABASE_ANON_KEY
--    - SUPABASE_SERVICE_ROLE_KEY (for server-side operations)
-- 3. Test the connection by running your application
--
-- IMPORTANT NOTES:
-- - This schema uses RLS but relies on service role key for server operations
-- - All timestamps are automatically managed via triggers
-- - The schema is idempotent - safe to run multiple times
-- - user_id in esim_purchases can store either Clerk user ID (text) or customer UUID (as text)
-- ============================================================================
