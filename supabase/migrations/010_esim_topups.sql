-- Migration: Add esim_topups table for eSIM Access top-up purchases

BEGIN;

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

COMMIT;

