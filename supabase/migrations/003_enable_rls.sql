-- ══════════════════════════════════════════════════════════════════
-- SECURITY: Enable Row Level Security on all tables
-- Run this in Supabase SQL Editor IMMEDIATELY
-- ══════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE clients              ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices             ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_vehicles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sublet_vehicles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sublet_bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_out            ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklist            ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff                ENABLE ROW LEVEL SECURITY;

-- Since we use service_role key in all API routes (bypasses RLS),
-- these policies protect against direct database access via anon key.
-- The policies below DENY all access to anon key users.

-- DENY anon access to all sensitive tables
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'clients','bookings','invoices','receipts','transactions',
    'fleet_vehicles','sublet_vehicles','sublet_bookings',
    'fleet_out','blacklist','staff'
  ]
  LOOP
    EXECUTE format('CREATE POLICY "deny_anon_%s" ON %I FOR ALL TO anon USING (false)', t, t);
  END LOOP;
END $$;

-- Allow service_role full access (our API routes use this)
-- service_role bypasses RLS by default — no policy needed

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
