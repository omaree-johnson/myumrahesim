-- Rename provider columns (idempotent: only rename when source exists and target does not)
DO $$
BEGIN
  -- purchases
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'purchases' AND column_name = 'esimaccess_response')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'purchases' AND column_name = 'esim_provider_response') THEN
    ALTER TABLE public.purchases RENAME COLUMN esimaccess_response TO esim_provider_response;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'purchases' AND column_name = 'esimaccess_status')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'purchases' AND column_name = 'esim_provider_status') THEN
    ALTER TABLE public.purchases RENAME COLUMN esimaccess_status TO esim_provider_status;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'purchases' AND column_name = 'esimaccess_cost')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'purchases' AND column_name = 'esim_provider_cost') THEN
    ALTER TABLE public.purchases RENAME COLUMN esimaccess_cost TO esim_provider_cost;
  END IF;
  -- esim_purchases
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'esim_purchases' AND column_name = 'esimaccess_response')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'esim_purchases' AND column_name = 'esim_provider_response') THEN
    ALTER TABLE public.esim_purchases RENAME COLUMN esimaccess_response TO esim_provider_response;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'esim_purchases' AND column_name = 'esimaccess_status')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'esim_purchases' AND column_name = 'esim_provider_status') THEN
    ALTER TABLE public.esim_purchases RENAME COLUMN esimaccess_status TO esim_provider_status;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'esim_purchases' AND column_name = 'esimaccess_cost')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'esim_purchases' AND column_name = 'esim_provider_cost') THEN
    ALTER TABLE public.esim_purchases RENAME COLUMN esimaccess_cost TO esim_provider_cost;
  END IF;
END $$;

-- Rename indexes only when old name exists and new name does not (idempotent re-run)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_purchases_esimaccess_status')
     AND NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_purchases_esim_provider_status') THEN
    ALTER INDEX public.idx_purchases_esimaccess_status RENAME TO idx_purchases_esim_provider_status;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_esim_purchases_esimaccess_status')
     AND NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_esim_purchases_esim_provider_status') THEN
    ALTER INDEX public.idx_esim_purchases_esimaccess_status RENAME TO idx_esim_purchases_esim_provider_status;
  END IF;
END $$;
