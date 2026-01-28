-- Migration: Authentication Security Tables
-- Purpose: Track failed login attempts, login history, and security events
-- Date: 2025-01-27

-- Failed login attempts tracking
CREATE TABLE IF NOT EXISTS public.failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_attempt_ip TEXT,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email ON public.failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_locked_until ON public.failed_login_attempts(locked_until);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_last_attempt_at ON public.failed_login_attempts(last_attempt_at);

-- Login history for anomaly detection
CREATE TABLE IF NOT EXISTS public.login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  ip TEXT NOT NULL,
  user_agent TEXT,
  location JSONB, -- { country, city, etc. }
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON public.login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON public.login_history(created_at);
CREATE INDEX IF NOT EXISTS idx_login_history_ip ON public.login_history(ip);
CREATE INDEX IF NOT EXISTS idx_login_history_user_created ON public.login_history(user_id, created_at);

-- Security events logging
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id TEXT,
  email TEXT,
  ip_address TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_email ON public.security_events(email);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON public.security_events(ip_address);

-- Update trigger for failed_login_attempts
CREATE OR REPLACE FUNCTION update_failed_login_attempts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_failed_login_attempts_updated_at ON public.failed_login_attempts;
CREATE TRIGGER update_failed_login_attempts_updated_at
  BEFORE UPDATE ON public.failed_login_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_failed_login_attempts_updated_at();

-- Cleanup old records (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_auth_records()
RETURNS void AS $$
BEGIN
  -- Delete old failed login attempts (older than 30 days, not locked)
  DELETE FROM public.failed_login_attempts
  WHERE locked_until IS NULL
    AND last_attempt_at < NOW() - INTERVAL '30 days';

  -- Delete old login history (older than 90 days)
  DELETE FROM public.login_history
  WHERE created_at < NOW() - INTERVAL '90 days';

  -- Delete old security events (older than 1 year)
  DELETE FROM public.security_events
  WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- RLS Policies - Only service role can access
ALTER TABLE IF EXISTS public.failed_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.security_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role only - failed_login_attempts" ON public.failed_login_attempts;
DROP POLICY IF EXISTS "Service role only - login_history" ON public.login_history;
DROP POLICY IF EXISTS "Service role only - security_events" ON public.security_events;

-- Create policies (service role only)
CREATE POLICY "Service role only - failed_login_attempts"
  ON public.failed_login_attempts
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role only - login_history"
  ON public.login_history
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role only - security_events"
  ON public.security_events
  FOR ALL
  USING (auth.role() = 'service_role');

-- Grant permissions to service role
GRANT ALL ON public.failed_login_attempts TO service_role;
GRANT ALL ON public.login_history TO service_role;
GRANT ALL ON public.security_events TO service_role;
