-- Migration: Enable RLS and lock down customer/order tables
-- Since this app uses Clerk (not Supabase Auth), we do NOT allow anon/client access.
-- Server routes use the Supabase service role key (bypasses RLS).

BEGIN;

-- Core tables
ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activation_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS esim_purchases ENABLE ROW LEVEL SECURITY;

-- Audit / tracking tables (created in 007)
ALTER TABLE IF EXISTS webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS esim_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS email_events ENABLE ROW LEVEL SECURITY;

-- Optional tables
ALTER TABLE IF EXISTS issuing_cards ENABLE ROW LEVEL SECURITY;

-- No policies are created on purpose: with RLS enabled and no policies,
-- all anon/authenticated client queries are denied.
-- Service role access continues to work for server routes and webhooks.

COMMIT;

