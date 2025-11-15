`-- `Migration: Add esim_purchases and issuing_cards tables for Stripe Issuing flow
-- This migration adds tables to support customer-funded automatic Zendit wallet top-up

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

