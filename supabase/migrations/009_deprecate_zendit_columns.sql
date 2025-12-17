-- Migration: Deprecate Zendit columns and ensure eSIM provider columns exist
-- The codebase no longer uses Zendit. We keep legacy columns for old data,
-- but ensure they no longer block inserts and that the canonical esim_provider_* columns exist.

BEGIN;

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

COMMIT;

