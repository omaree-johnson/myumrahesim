-- Migration: Security Alerts Table
-- Purpose: Track security alerts for monitoring and incident response
-- Date: 2025-01-27

-- Security alerts table
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id TEXT,
  email TEXT, -- Sanitized email
  ip_address TEXT,
  details JSONB DEFAULT '{}',
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_alerts_event_type ON public.security_alerts(event_type);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON public.security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_category ON public.security_alerts(category);
CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON public.security_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_ip_address ON public.security_alerts(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_alerts_triggered_at ON public.security_alerts(triggered_at);
CREATE INDEX IF NOT EXISTS idx_security_alerts_acknowledged ON public.security_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_security_alerts_resolved ON public.security_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_security_alerts_unresolved ON public.security_alerts(severity, acknowledged, resolved) 
  WHERE acknowledged = false OR resolved = false;

-- Update trigger
CREATE OR REPLACE FUNCTION update_security_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_security_alerts_updated_at ON public.security_alerts;
CREATE TRIGGER update_security_alerts_updated_at
  BEFORE UPDATE ON public.security_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_security_alerts_updated_at();

-- Enable RLS
ALTER TABLE IF EXISTS public.security_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Service role only
DROP POLICY IF EXISTS "Service role only - security_alerts" ON public.security_alerts;
CREATE POLICY "Service role only - security_alerts"
  ON public.security_alerts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON public.security_alerts TO service_role;
