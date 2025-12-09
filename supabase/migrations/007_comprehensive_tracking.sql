-- Migration: Comprehensive Tracking for eSIM Purchases, Actions, and Events
-- This migration adds all missing fields and creates audit tables for complete tracking

BEGIN;

-- ============================================================================
-- 1. ADD MISSING FIELDS TO esim_purchases TABLE
-- ============================================================================

-- Add esim_tran_no (eSIM transaction number from provider)
ALTER TABLE esim_purchases 
ADD COLUMN IF NOT EXISTS esim_tran_no text;

-- Add package_code (provider package identifier)
ALTER TABLE esim_purchases 
ADD COLUMN IF NOT EXISTS package_code text;

-- Add product_name (human-readable product name)
ALTER TABLE esim_purchases 
ADD COLUMN IF NOT EXISTS product_name text;

-- Add esim_provider_error_code (for tracking specific error codes)
ALTER TABLE esim_purchases 
ADD COLUMN IF NOT EXISTS esim_provider_error_code text;

-- Add esim_provider_error_message (for tracking error messages)
ALTER TABLE esim_purchases 
ADD COLUMN IF NOT EXISTS esim_provider_error_message text;

-- Add webhook_event_id (to track which webhook event processed this)
ALTER TABLE esim_purchases 
ADD COLUMN IF NOT EXISTS webhook_event_id text;

-- Add payment_method (card, wallet, etc.)
ALTER TABLE esim_purchases 
ADD COLUMN IF NOT EXISTS payment_method text;

-- Add payment_method_details (JSONB for additional payment method info)
ALTER TABLE esim_purchases 
ADD COLUMN IF NOT EXISTS payment_method_details jsonb;

-- Add refund_status (null, pending, succeeded, failed)
ALTER TABLE esim_purchases 
ADD COLUMN IF NOT EXISTS refund_status text;

-- Add refund_amount (amount refunded in cents)
ALTER TABLE esim_purchases 
ADD COLUMN IF NOT EXISTS refund_amount integer;

-- Add refund_reason (reason for refund if applicable)
ALTER TABLE esim_purchases 
ADD COLUMN IF NOT EXISTS refund_reason text;

-- Add notes (admin notes or internal notes)
ALTER TABLE esim_purchases 
ADD COLUMN IF NOT EXISTS notes text;

-- ============================================================================
-- 2. ADD MISSING FIELDS TO activation_details TABLE
-- ============================================================================

-- Add esim_tran_no (link activation to eSIM transaction)
ALTER TABLE activation_details 
ADD COLUMN IF NOT EXISTS esim_tran_no text;

-- Add order_no (link activation to order number)
ALTER TABLE activation_details 
ADD COLUMN IF NOT EXISTS order_no text;

-- Add universal_link (alternative activation method)
ALTER TABLE activation_details 
ADD COLUMN IF NOT EXISTS universal_link text;

-- Add qr_code (base64 or URL to QR code image)
ALTER TABLE activation_details 
ADD COLUMN IF NOT EXISTS qr_code text;

-- Add activation_status (pending, active, expired, cancelled)
ALTER TABLE activation_details 
ADD COLUMN IF NOT EXISTS activation_status text DEFAULT 'pending';

-- Add activated_at (when eSIM was activated)
ALTER TABLE activation_details 
ADD COLUMN IF NOT EXISTS activated_at timestamptz;

-- Add expires_at (when eSIM expires)
ALTER TABLE activation_details 
ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Add data_used (amount of data used in bytes, if available)
ALTER TABLE activation_details 
ADD COLUMN IF NOT EXISTS data_used bigint;

-- Add data_limit (total data limit in bytes, if available)
ALTER TABLE activation_details 
ADD COLUMN IF NOT EXISTS data_limit bigint;

-- ============================================================================
-- 3. CREATE WEBHOOK_EVENTS TABLE (Audit Trail for Webhooks)
-- ============================================================================

CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE NOT NULL, -- Stripe/eSIM Access event ID
  event_type text NOT NULL, -- payment_intent.succeeded, order.status, etc.
  source text NOT NULL, -- 'stripe', 'esimaccess', 'zendit', etc.
  transaction_id text, -- Link to transaction
  order_no text, -- Link to order
  esim_tran_no text, -- Link to eSIM transaction
  payload jsonb NOT NULL, -- Full webhook payload
  processed boolean DEFAULT false, -- Whether we successfully processed it
  processing_error text, -- Error message if processing failed
  processing_attempts integer DEFAULT 0, -- Number of processing attempts
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 4. CREATE PAYMENT_ACTIONS TABLE (Audit Trail for Payment Actions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text NOT NULL, -- Link to transaction
  payment_intent_id text, -- Stripe payment intent ID
  action_type text NOT NULL, -- 'created', 'confirmed', 'succeeded', 'failed', 'refunded', 'disputed'
  action_status text NOT NULL, -- 'pending', 'processing', 'succeeded', 'failed'
  amount integer, -- Amount in cents
  currency text, -- Currency code
  metadata jsonb, -- Additional action metadata
  error_code text, -- Error code if action failed
  error_message text, -- Error message if action failed
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 5. CREATE ESIM_ACTIONS TABLE (Audit Trail for eSIM Provider Actions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS esim_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text, -- Link to transaction
  order_no text, -- Provider order number
  esim_tran_no text, -- Provider eSIM transaction number
  action_type text NOT NULL, -- 'order_created', 'order_processing', 'activation_ready', 'activation_sent', 'order_failed', 'order_cancelled'
  action_status text NOT NULL, -- 'pending', 'processing', 'succeeded', 'failed'
  provider text NOT NULL, -- 'esimaccess', 'zendit', etc.
  provider_response jsonb, -- Full provider response
  error_code text, -- Provider error code if action failed
  error_message text, -- Provider error message if action failed
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 6. CREATE EMAIL_EVENTS TABLE (Audit Trail for Email Sending)
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text, -- Link to transaction
  order_no text, -- Link to order
  email_type text NOT NULL, -- 'order_confirmation', 'activation', 'admin_notification', 'refund', etc.
  recipient_email text NOT NULL,
  recipient_name text,
  subject text,
  email_provider text, -- 'resend', 'sendgrid', etc.
  email_provider_id text, -- Provider's email ID
  status text NOT NULL, -- 'pending', 'sent', 'delivered', 'bounced', 'failed'
  error_message text, -- Error if sending failed
  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Indexes for esim_purchases
CREATE INDEX IF NOT EXISTS idx_esim_purchases_esim_tran_no ON esim_purchases(esim_tran_no);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_package_code ON esim_purchases(package_code);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_product_name ON esim_purchases(product_name);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_webhook_event_id ON esim_purchases(webhook_event_id);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_refund_status ON esim_purchases(refund_status);
CREATE INDEX IF NOT EXISTS idx_esim_purchases_created_at ON esim_purchases(created_at);

-- Indexes for activation_details
CREATE INDEX IF NOT EXISTS idx_activation_details_esim_tran_no ON activation_details(esim_tran_no);
CREATE INDEX IF NOT EXISTS idx_activation_details_order_no ON activation_details(order_no);
CREATE INDEX IF NOT EXISTS idx_activation_details_activation_status ON activation_details(activation_status);
CREATE INDEX IF NOT EXISTS idx_activation_details_iccid ON activation_details(iccid);

-- Indexes for webhook_events
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_source ON webhook_events(source);
CREATE INDEX IF NOT EXISTS idx_webhook_events_transaction_id ON webhook_events(transaction_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_order_no ON webhook_events(order_no);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);

-- Indexes for payment_actions
CREATE INDEX IF NOT EXISTS idx_payment_actions_transaction_id ON payment_actions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_actions_payment_intent_id ON payment_actions(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_actions_action_type ON payment_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_payment_actions_action_status ON payment_actions(action_status);
CREATE INDEX IF NOT EXISTS idx_payment_actions_created_at ON payment_actions(created_at);

-- Indexes for esim_actions
CREATE INDEX IF NOT EXISTS idx_esim_actions_transaction_id ON esim_actions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_esim_actions_order_no ON esim_actions(order_no);
CREATE INDEX IF NOT EXISTS idx_esim_actions_esim_tran_no ON esim_actions(esim_tran_no);
CREATE INDEX IF NOT EXISTS idx_esim_actions_action_type ON esim_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_esim_actions_provider ON esim_actions(provider);
CREATE INDEX IF NOT EXISTS idx_esim_actions_created_at ON esim_actions(created_at);

-- Indexes for email_events
CREATE INDEX IF NOT EXISTS idx_email_events_transaction_id ON email_events(transaction_id);
CREATE INDEX IF NOT EXISTS idx_email_events_order_no ON email_events(order_no);
CREATE INDEX IF NOT EXISTS idx_email_events_email_type ON email_events(email_type);
CREATE INDEX IF NOT EXISTS idx_email_events_recipient_email ON email_events(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_events_status ON email_events(status);
CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON email_events(created_at);

-- ============================================================================
-- 8. ADD UPDATED_AT TRIGGERS FOR NEW TABLES
-- ============================================================================

CREATE TRIGGER update_webhook_events_updated_at BEFORE UPDATE ON webhook_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_actions_updated_at BEFORE UPDATE ON payment_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_esim_actions_updated_at BEFORE UPDATE ON esim_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_events_updated_at BEFORE UPDATE ON email_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. ADD FOREIGN KEY CONSTRAINTS (Optional - for referential integrity)
-- ============================================================================

-- Note: These are optional and may fail if there are existing orphaned records
-- Uncomment if you want strict referential integrity

-- ALTER TABLE webhook_events
--   ADD CONSTRAINT fk_webhook_events_transaction 
--   FOREIGN KEY (transaction_id) 
--   REFERENCES esim_purchases(transaction_id) 
--   ON DELETE SET NULL;

-- ALTER TABLE payment_actions
--   ADD CONSTRAINT fk_payment_actions_transaction 
--   FOREIGN KEY (transaction_id) 
--   REFERENCES esim_purchases(transaction_id) 
--   ON DELETE CASCADE;

-- ALTER TABLE esim_actions
--   ADD CONSTRAINT fk_esim_actions_transaction 
--   FOREIGN KEY (transaction_id) 
--   REFERENCES esim_purchases(transaction_id) 
--   ON DELETE SET NULL;

-- ALTER TABLE email_events
--   ADD CONSTRAINT fk_email_events_transaction 
--   FOREIGN KEY (transaction_id) 
--   REFERENCES esim_purchases(transaction_id) 
--   ON DELETE SET NULL;

-- ============================================================================
-- 10. CREATE VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Complete purchase information with all related data
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

-- View: Recent payment actions summary
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

-- View: eSIM actions timeline
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

-- View: Email delivery status
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

COMMIT;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- This migration adds comprehensive tracking for:
-- 1. Missing fields in esim_purchases (esim_tran_no, package_code, product_name, etc.)
-- 2. Missing fields in activation_details (esim_tran_no, order_no, universal_link, etc.)
-- 3. Webhook event audit trail (webhook_events table)
-- 4. Payment action audit trail (payment_actions table)
-- 5. eSIM provider action audit trail (esim_actions table)
-- 6. Email event audit trail (email_events table)
-- 7. Performance indexes for all new fields and tables
-- 8. Useful views for common queries
-- ============================================================================

