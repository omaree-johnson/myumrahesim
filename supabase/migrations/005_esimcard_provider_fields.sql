BEGIN;

-- Rename provider columns on purchases table
ALTER TABLE purchases
  RENAME COLUMN IF EXISTS esimaccess_response TO esim_provider_response;

ALTER TABLE purchases
  RENAME COLUMN IF EXISTS esimaccess_status TO esim_provider_status;

ALTER TABLE purchases
  RENAME COLUMN IF EXISTS esimaccess_cost TO esim_provider_cost;

-- Rename provider columns on esim_purchases table
ALTER TABLE esim_purchases
  RENAME COLUMN IF EXISTS esimaccess_response TO esim_provider_response;

ALTER TABLE esim_purchases
  RENAME COLUMN IF EXISTS esimaccess_status TO esim_provider_status;

ALTER TABLE esim_purchases
  RENAME COLUMN IF EXISTS esimaccess_cost TO esim_provider_cost;

-- Rename indexes if they exist
ALTER INDEX IF EXISTS idx_purchases_esimaccess_status
  RENAME TO idx_purchases_esim_provider_status;

ALTER INDEX IF EXISTS idx_esim_purchases_esimaccess_status
  RENAME TO idx_esim_purchases_esim_provider_status;

COMMIT;

