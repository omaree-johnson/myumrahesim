-- Migration: Ramadan Promotional Periods
-- Stores pre-calculated Gregorian date ranges for Ramadan promo periods
-- Enables fast, reliable date checks without runtime Hijri conversion

BEGIN;

-- Table to store pre-calculated Ramadan promo periods
CREATE TABLE IF NOT EXISTS public.ramadan_promo_periods (
  hijri_year INTEGER PRIMARY KEY,
  start_date DATE NOT NULL,  -- 15 Sha'ban in Gregorian calendar
  end_date DATE NOT NULL,     -- Last day of Ramadan in Gregorian calendar
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  calculated_by TEXT DEFAULT 'system',
  verified BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_ramadan_promo_periods_dates 
  ON public.ramadan_promo_periods(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_ramadan_promo_periods_hijri_year 
  ON public.ramadan_promo_periods(hijri_year);

-- Function to check if current date is within an active promo period
CREATE OR REPLACE FUNCTION public.is_ramadan_promo_active()
RETURNS BOOLEAN AS $$
DECLARE
  active_period RECORD;
BEGIN
  SELECT * INTO active_period
  FROM public.ramadan_promo_periods
  WHERE CURRENT_DATE BETWEEN start_date AND end_date
  ORDER BY hijri_year DESC
  LIMIT 1;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get current active promo period (if any)
CREATE OR REPLACE FUNCTION public.get_active_ramadan_promo_period()
RETURNS TABLE (
  hijri_year INTEGER,
  start_date DATE,
  end_date DATE,
  days_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rpp.hijri_year,
    rpp.start_date,
    rpp.end_date,
    (rpp.end_date - CURRENT_DATE)::INTEGER AS days_remaining
  FROM public.ramadan_promo_periods rpp
  WHERE CURRENT_DATE BETWEEN rpp.start_date AND rpp.end_date
  ORDER BY rpp.hijri_year DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Trigger to update updated_at
CREATE TRIGGER update_ramadan_promo_periods_updated_at 
  BEFORE UPDATE ON public.ramadan_promo_periods
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.ramadan_promo_periods IS 
  'Pre-calculated Gregorian date ranges for Ramadan promotional periods. Each row represents one Hijri year. Start date is 15 Sha''ban, end date is last day of Ramadan.';

COMMENT ON FUNCTION public.is_ramadan_promo_active() IS 
  'Returns true if current date falls within any active Ramadan promo period. Fast database lookup without runtime Hijri conversion.';

COMMIT;
