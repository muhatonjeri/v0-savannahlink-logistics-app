-- ── Service Terms & Currency Settings ──────────────────────────
-- Run in Supabase SQL Editor

-- Service terms table (admin-editable T&C per service)
CREATE TABLE IF NOT EXISTS service_terms (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id   text UNIQUE NOT NULL,
  terms        jsonb DEFAULT '[]',
  updated_at   timestamptz DEFAULT now()
);

-- Currency settings
CREATE TABLE IF NOT EXISTS currency_settings (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  base_currency text DEFAULT 'KES',
  enabled_currencies jsonb DEFAULT '["USD","EUR","GBP","UGX","TZS","RWF"]',
  updated_at   timestamptz DEFAULT now()
);

-- Insert default currency row
INSERT INTO currency_settings (base_currency) VALUES ('KES') ON CONFLICT DO NOTHING;

-- Disable RLS on new tables
ALTER TABLE service_terms DISABLE ROW LEVEL SECURITY;
ALTER TABLE currency_settings DISABLE ROW LEVEL SECURITY;
