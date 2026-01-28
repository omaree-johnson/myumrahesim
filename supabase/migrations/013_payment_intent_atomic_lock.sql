-- Migration: Payment Intent Atomic Lock
-- Purpose: Prevent race conditions in webhook processing
-- Date: 2025-01-27

-- Function to atomically check and mark payment intent as processed
CREATE OR REPLACE FUNCTION mark_payment_intent_processed(
  p_payment_intent_id TEXT,
  p_transaction_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
  v_inserted_id UUID;
BEGIN
  -- Check if already processed (with row lock to prevent race conditions)
  SELECT EXISTS(
    SELECT 1 FROM esim_purchases
    WHERE stripe_payment_intent_id = p_payment_intent_id
    FOR UPDATE
  ) INTO v_exists;

  IF v_exists THEN
    RETURN FALSE; -- Already processed
  END IF;

  -- Try to insert (will fail if duplicate due to unique constraint)
  INSERT INTO esim_purchases (
    stripe_payment_intent_id,
    transaction_id,
    stripe_payment_status,
    esim_provider_status,
    created_at
  ) VALUES (
    p_payment_intent_id,
    p_transaction_id,
    'processing',
    'pending',
    NOW()
  )
  ON CONFLICT (stripe_payment_intent_id) DO NOTHING
  RETURNING id INTO v_inserted_id;

  -- Check if insert succeeded
  IF v_inserted_id IS NULL THEN
    RETURN FALSE; -- Insert failed (likely duplicate)
  END IF;

  RETURN TRUE; -- Successfully inserted
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint on stripe_payment_intent_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'esim_purchases_stripe_payment_intent_id_unique'
  ) THEN
    ALTER TABLE esim_purchases
    ADD CONSTRAINT esim_purchases_stripe_payment_intent_id_unique
    UNIQUE (stripe_payment_intent_id);
  END IF;
END $$;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_esim_purchases_stripe_payment_intent_id 
ON esim_purchases(stripe_payment_intent_id);

-- Add index for webhook event deduplication
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id_source 
ON webhook_events(event_id, source) 
WHERE processed = true;
