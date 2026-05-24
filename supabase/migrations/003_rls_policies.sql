-- ══════════════════════════════════════════════════════════════
-- SUPABASE ROW LEVEL SECURITY POLICIES
-- Run this in Supabase SQL Editor to protect your data
-- ══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE clients              ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices             ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklist            ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff                ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_vehicles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_out            ENABLE ROW LEVEL SECURITY;
ALTER TABLE sublet_vehicles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sublet_bookings      ENABLE ROW LEVEL SECURITY;

-- Since we use service role key on the server (bypasses RLS),
-- these policies protect against direct Supabase Dashboard access
-- and any accidental anon key usage.

-- Policy: Only service role can access all data
-- The anon key gets NOTHING — all access goes through our API
CREATE POLICY "service_role_only" ON clients              FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_only" ON bookings             FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_only" ON invoices             FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_only" ON receipts             FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_only" ON transactions         FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_only" ON blacklist            FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_only" ON staff                FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_only" ON fleet_vehicles       FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_only" ON fleet_out            FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_only" ON sublet_vehicles      FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_only" ON sublet_bookings      FOR ALL USING (auth.role() = 'service_role');

-- IMPORTANT: After running this, go to Supabase Dashboard → Settings → API
-- and DISABLE the anon key or restrict it to specific tables only.
-- Your app uses the service role key which bypasses RLS.
