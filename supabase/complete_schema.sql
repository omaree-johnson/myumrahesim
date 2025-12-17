-- ============================================================================
-- COMPLETE DATABASE SCHEMA FOR eSIM PWA
-- ============================================================================
-- This script creates all tables, indexes, triggers, views, and RLS policies
-- needed for the application. Run this in Supabase SQL Editor after wiping
-- the public schema (or on a fresh database).
--
-- IMPORTANT: Select ALL text (Cmd/Ctrl+A) before clicking Run.
-- ============================================================================

BEGIN;

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 001: INITIAL SCHEMA (customers, purchases, activation_details)
-- ============================================================================

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  clerk_user_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create purchases table (legacy - kept for backward compatibility)
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activation_details table
CREATE TABLE IF NOT EXISTS activation_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT UNIQUE NOT NULL REFERENCES purchases(transaction_id),
  qr_code_url TEXT,
  smdp_address TEXT,
  activation_code TEXT,
  iccid TEXT,
  confirmation_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_purchases_transaction_id ON purchases(transaction_id);
CREATE INDEX IF NOT EXISTS idx_purchases_customer_email ON purchases(customer_email);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_activation_details_transaction_id ON activation_details(transaction_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_clerk_user_id ON customers(clerk_user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activation_details_updated_at BEFORE UPDATE ON activation_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 002: ADD STRIPE FIELDS TO purchases
-- ============================================================================

ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent TEXT;

CREATE INDEX IF NOT EXISTS idx_purchases_stripe_session_id ON purchases(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_payment_intent ON purchases(stripe_payment_intent);

-- ============================================================================
-- 003: esim_purchases AND issuing_cards TABLES
-- ============================================================================

-- Create esim_purchases table (enhanced version with Stripe Issuing fields)
CREATE TABLE IF NOT EXISTS esim_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL, -- Clerk user id
  offer_id text NOT NULL,
  price integer NOT NULL, -- in smallest currency unit (cents)
  currency text NOT NULL DEFAULT 'USD',
  zendit_cost integer NOT NULL, -- cost in smallest currency unit
  transaction_id text UNIQUE NOT NULL, -- our unique id
  stripe_payment_intent_id text,
  stripe_charge_id text,
  stripe_payment_status text,
  stripe_issuing_card_id text,
  zendit_transaction_id text,
  zendit_status text,
  confirmation jsonb,
  qr_code_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create issuing_cards table
CREATE TABLE IF NOT EXISTS issuing_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id text UNIQUE, -- stripe issuing card id
  card_last4 text,
  card_exp text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_esim_purchases_user_id ON esim_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_transaction_id ON esim_purchases(transaction_id);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_stripe_payment_intent_id ON esim_purchases(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_zendit_status ON esim_purchases(zendit_status);
CREATE INDEX IF NOT EXISTS idx_issuing_cards_card_id ON issuing_cards(card_id);
CREATE INDEX IF NOT EXISTS idx_issuing_cards_active ON issuing_cards(active);

-- Add updated_at trigger for esim_purchases
CREATE TRIGGER update_esim_purchases_updated_at BEFORE UPDATE ON esim_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 004: ADD eSIM ACCESS FIELDS
-- ============================================================================

-- Add eSIM Access fields to purchases table
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS order_no text,
ADD COLUMN IF NOT EXISTS esimaccess_response jsonb,
ADD COLUMN IF NOT EXISTS esimaccess_status text,
ADD COLUMN IF NOT EXISTS esimaccess_cost integer;

-- Add eSIM Access fields to esim_purchases table
ALTER TABLE esim_purchases 
ADD COLUMN IF NOT EXISTS order_no text,
ADD COLUMN IF NOT EXISTS esimaccess_response jsonb,
ADD COLUMN IF NOT EXISTS esimaccess_status text,
ADD COLUMN IF NOT EXISTS esimaccess_cost integer;

-- Create index on order_no for faster lookups
CREATE INDEX IF NOT EXISTS idx_purchases_order_no ON purchases(order_no);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_order_no ON esim_purchases(order_no);
CREATE INDEX IF NOT EXISTS idx_purchases_esimaccess_status ON purchases(esimaccess_status);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_esimaccess_status ON esim_purchases(esimaccess_status);

-- ============================================================================
-- 005: RENAME PROVIDER COLUMNS (generic naming)
-- ============================================================================

DO $$
BEGIN
  -- Rename provider columns on purchases table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'purchases' AND column_name = 'esimaccess_response'
  ) THEN
    ALTER TABLE public.purchases RENAME COLUMN esimaccess_response TO esim_provider_response;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'purchases' AND column_name = 'esimaccess_status'
  ) THEN
    ALTER TABLE public.purchases RENAME COLUMN esimaccess_status TO esim_provider_status;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'purchases' AND column_name = 'esimaccess_cost'
  ) THEN
    ALTER TABLE public.purchases RENAME COLUMN esimaccess_cost TO esim_provider_cost;
  END IF;

  -- Rename provider columns on esim_purchases table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'esim_purchases' AND column_name = 'esimaccess_response'
  ) THEN
    ALTER TABLE public.esim_purchases RENAME COLUMN esimaccess_response TO esim_provider_response;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'esim_purchases' AND column_name = 'esimaccess_status'
  ) THEN
    ALTER TABLE public.esim_purchases RENAME COLUMN esimaccess_status TO esim_provider_status;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'esim_purchases' AND column_name = 'esimaccess_cost'
  ) THEN
    ALTER TABLE public.esim_purchases RENAME COLUMN esimaccess_cost TO esim_provider_cost;
  END IF;
END $$;

-- Rename indexes if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'idx_purchases_esimaccess_status'
  ) THEN
    ALTER INDEX public.idx_purchases_esimaccess_status RENAME TO idx_purchases_esim_provider_status;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'idx_esim_purchases_esimaccess_status'
  ) THEN
    ALTER INDEX public.idx_esim_purchases_esimaccess_status RENAME TO idx_esim_purchases_esim_provider_status;
  END IF;
END $$;

-- ============================================================================
-- 006: ADD CUSTOMER FIELDS TO esim_purchases
-- ============================================================================

-- Add customer email and name columns to esim_purchases table
ALTER TABLE esim_purchases 
ADD COLUMN IF NOT EXISTS customer_email text,
ADD COLUMN IF NOT EXISTS customer_name text;

-- Create index on customer_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_esim_purchases_customer_email ON esim_purchases(customer_email);

-- ============================================================================
-- 007: COMPREHENSIVE TRACKING (additional fields + audit tables)
-- ============================================================================

-- Add missing fields to esim_purchases table
ALTER TABLE esim_purchases 
ADD COLUMN IF NOT EXISTS esim_tran_no text,
ADD COLUMN IF NOT EXISTS package_code text,
ADD COLUMN IF NOT EXISTS product_name text,
ADD COLUMN IF NOT EXISTS esim_provider_error_code text,
ADD COLUMN IF NOT EXISTS esim_provider_error_message text,
ADD COLUMN IF NOT EXISTS webhook_event_id text,
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS payment_method_details jsonb,
ADD COLUMN IF NOT EXISTS refund_status text,
ADD COLUMN IF NOT EXISTS refund_amount integer,
ADD COLUMN IF NOT EXISTS refund_reason text,
ADD COLUMN IF NOT EXISTS notes text;

-- Add missing fields to activation_details table
ALTER TABLE activation_details 
ADD COLUMN IF NOT EXISTS esim_tran_no text,
ADD COLUMN IF NOT EXISTS order_no text,
ADD COLUMN IF NOT EXISTS universal_link text,
ADD COLUMN IF NOT EXISTS qr_code text,
ADD COLUMN IF NOT EXISTS activation_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS activated_at timestamptz,
ADD COLUMN IF NOT EXISTS expires_at timestamptz,
ADD COLUMN IF NOT EXISTS data_used bigint,
ADD COLUMN IF NOT EXISTS data_limit bigint;

-- Create webhook_events table
CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  source text NOT NULL,
  transaction_id text,
  order_no text,
  esim_tran_no text,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  processing_error text,
  processing_attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Create payment_actions table
CREATE TABLE IF NOT EXISTS payment_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text NOT NULL,
  payment_intent_id text,
  action_type text NOT NULL,
  action_status text NOT NULL,
  amount integer,
  currency text,
  metadata jsonb,
  error_code text,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create esim_actions table
CREATE TABLE IF NOT EXISTS esim_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text,
  order_no text,
  esim_tran_no text,
  action_type text NOT NULL,
  action_status text NOT NULL,
  provider text NOT NULL,
  provider_response jsonb,
  error_code text,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create email_events table
CREATE TABLE IF NOT EXISTS email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text,
  order_no text,
  email_type text NOT NULL,
  recipient_email text NOT NULL,
  recipient_name text,
  subject text,
  email_provider text,
  email_provider_id text,
  status text NOT NULL,
  error_message text,
  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_esim_purchases_esim_tran_no ON esim_purchases(esim_tran_no);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_package_code ON esim_purchases(package_code);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_product_name ON esim_purchases(product_name);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_webhook_event_id ON esim_purchases(webhook_event_id);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_refund_status ON esim_purchases(refund_status);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_created_at ON esim_purchases(created_at);

CREATE INDEX IF NOT EXISTS idx_activation_details_esim_tran_no ON activation_details(esim_tran_no);
CREATE INDEX IF NOT EXISTS idx_activation_details_order_no ON activation_details(order_no);
CREATE INDEX IF NOT EXISTS idx_activation_details_activation_status ON activation_details(activation_status);
CREATE INDEX IF NOT EXISTS idx_activation_details_iccid ON activation_details(iccid);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_source ON webhook_events(source);
CREATE INDEX IF NOT EXISTS idx_webhook_events_transaction_id ON webhook_events(transaction_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_order_no ON webhook_events(order_no);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);

CREATE INDEX IF NOT EXISTS idx_payment_actions_transaction_id ON payment_actions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_actions_payment_intent_id ON payment_actions(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_actions_action_type ON payment_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_payment_actions_action_status ON payment_actions(action_status);
CREATE INDEX IF NOT EXISTS idx_payment_actions_created_at ON payment_actions(created_at);

CREATE INDEX IF NOT EXISTS idx_esim_actions_transaction_id ON esim_actions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_esim_actions_order_no ON esim_actions(order_no);
CREATE INDEX IF NOT EXISTS idx_esim_actions_esim_tran_no ON esim_actions(esim_tran_no);
CREATE INDEX IF NOT EXISTS idx_esim_actions_action_type ON esim_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_esim_actions_provider ON esim_actions(provider);
CREATE INDEX IF NOT EXISTS idx_esim_actions_created_at ON esim_actions(created_at);

CREATE INDEX IF NOT EXISTS idx_email_events_transaction_id ON email_events(transaction_id);
CREATE INDEX IF NOT EXISTS idx_email_events_order_no ON email_events(order_no);
CREATE INDEX IF NOT EXISTS idx_email_events_email_type ON email_events(email_type);
CREATE INDEX IF NOT EXISTS idx_email_events_recipient_email ON email_events(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_events_status ON email_events(status);
CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON email_events(created_at);

-- Add updated_at triggers for new tables
CREATE TRIGGER update_webhook_events_updated_at BEFORE UPDATE ON webhook_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_actions_updated_at BEFORE UPDATE ON payment_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_esim_actions_updated_at BEFORE UPDATE ON esim_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_events_updated_at BEFORE UPDATE ON email_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
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
-- 008: ENABLE RLS LOCKDOWN
-- ============================================================================

-- Core tables
ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activation_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS esim_purchases ENABLE ROW LEVEL SECURITY;

-- Audit / tracking tables
ALTER TABLE IF EXISTS webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS esim_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS email_events ENABLE ROW LEVEL SECURITY;

-- Optional tables
ALTER TABLE IF EXISTS issuing_cards ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 009: DEPRECATE ZENDIT COLUMNS (ensure canonical columns exist)
-- ============================================================================

DO $$
BEGIN
  -- Ensure esim_provider_cost exists (some older DBs only had zendit_cost)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'esim_purchases' AND column_name = 'esim_provider_cost'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'esim_purchases' AND column_name = 'zendit_cost'
    ) THEN
      ALTER TABLE public.esim_purchases RENAME COLUMN zendit_cost TO esim_provider_cost;
    ELSE
      ALTER TABLE public.esim_purchases ADD COLUMN esim_provider_cost integer;
    END IF;
  END IF;

  -- Ensure esim_provider_status exists (some older DBs only had zendit_status)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'esim_purchases' AND column_name = 'esim_provider_status'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'esim_purchases' AND column_name = 'zendit_status'
    ) THEN
      ALTER TABLE public.esim_purchases RENAME COLUMN zendit_status TO esim_provider_status;
    ELSE
      ALTER TABLE public.esim_purchases ADD COLUMN esim_provider_status text;
    END IF;
  END IF;

  -- If zendit_cost still exists, make it nullable so it won't break inserts
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'esim_purchases' AND column_name = 'zendit_cost'
  ) THEN
    EXECUTE 'ALTER TABLE public.esim_purchases ALTER COLUMN zendit_cost DROP NOT NULL';
  END IF;
END $$;

-- Keep a helpful index for the new canonical status column
CREATE INDEX IF NOT EXISTS idx_esim_purchases_esim_provider_status ON public.esim_purchases(esim_provider_status);

-- ============================================================================
-- 010: esim_topups TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS esim_topups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL, -- Clerk user id or 'anonymous'
  customer_email text,
  customer_name text,
  iccid text NOT NULL,
  package_code text NOT NULL, -- topup package code
  price integer NOT NULL, -- selling price in cents
  currency text NOT NULL DEFAULT 'USD',
  esim_provider_cost integer, -- provider cost in cents (if available)
  transaction_id text UNIQUE NOT NULL,
  stripe_payment_intent_id text,
  stripe_payment_status text,
  payment_method text,
  payment_method_details jsonb,
  esim_provider_status text DEFAULT 'pending',
  esim_provider_response jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_esim_topups_customer_email ON esim_topups(customer_email);
CREATE INDEX IF NOT EXISTS idx_esim_topups_iccid ON esim_topups(iccid);
CREATE INDEX IF NOT EXISTS idx_esim_topups_transaction_id ON esim_topups(transaction_id);
CREATE INDEX IF NOT EXISTS idx_esim_topups_payment_intent_id ON esim_topups(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_esim_topups_created_at ON esim_topups(created_at);

-- Enable RLS and lock down (no policies; service role bypasses)
ALTER TABLE IF EXISTS esim_topups ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger
CREATE TRIGGER update_esim_topups_updated_at BEFORE UPDATE ON esim_topups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 011: MARKETING AUTOMATION (discounts, reviews, cart sessions, usage alerts)
-- ============================================================================

-- Activation details: cache usage fetch metadata for UI + rate limiting
ALTER TABLE IF EXISTS public.activation_details
  ADD COLUMN IF NOT EXISTS usage_refreshed_at timestamptz,
  ADD COLUMN IF NOT EXISTS usage_last_update_time text;

CREATE INDEX IF NOT EXISTS idx_activation_details_usage_refreshed_at
  ON public.activation_details(usage_refreshed_at);

-- Discount codes (single-use) + reservations + redemptions
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

-- Usage alert dedupe + discount issuance tracking
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

-- Cart sessions (abandonment reminders + restore token)
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

-- Reviews (moderation-ready)
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

-- RLS lockdown (no policies)
ALTER TABLE IF EXISTS public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.discount_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.discount_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.usage_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cart_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;

COMMIT;

-- ============================================================================
-- SCHEMA CREATION COMPLETE
-- ============================================================================
-- All tables, indexes, triggers, views, and RLS policies have been created.
-- The database is now ready for the eSIM PWA application.
-- ============================================================================
