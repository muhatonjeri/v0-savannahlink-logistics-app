-- ══════════════════════════════════════════════════════════════
-- AUDIT LOG TABLE — Track all data changes
-- Run in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_log (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name  text NOT NULL,
  record_id   text,
  action      text NOT NULL,  -- INSERT, UPDATE, DELETE
  old_data    jsonb,
  new_data    jsonb,
  user_email  text,
  ip_address  text,
  created_at  timestamptz DEFAULT now()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_audit_table    ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_record   ON audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_created  ON audit_log(created_at DESC);

-- Trigger function to auto-log changes
CREATE OR REPLACE FUNCTION log_audit_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log(table_name, record_id, action, old_data)
    VALUES(TG_TABLE_NAME, OLD.id::text, 'DELETE', row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log(table_name, record_id, action, old_data, new_data)
    VALUES(TG_TABLE_NAME, NEW.id::text, 'UPDATE', row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log(table_name, record_id, action, new_data)
    VALUES(TG_TABLE_NAME, NEW.id::text, 'INSERT', row_to_json(NEW));
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers to sensitive tables
CREATE TRIGGER audit_clients    AFTER INSERT OR UPDATE OR DELETE ON clients         FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
CREATE TRIGGER audit_bookings   AFTER INSERT OR UPDATE OR DELETE ON bookings        FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
CREATE TRIGGER audit_invoices   AFTER INSERT OR UPDATE OR DELETE ON invoices        FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
CREATE TRIGGER audit_receipts   AFTER INSERT OR UPDATE OR DELETE ON receipts        FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
CREATE TRIGGER audit_blacklist  AFTER INSERT OR UPDATE OR DELETE ON blacklist       FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
CREATE TRIGGER audit_staff      AFTER INSERT OR UPDATE OR DELETE ON staff           FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
CREATE TRIGGER audit_trans      AFTER INSERT OR UPDATE OR DELETE ON transactions    FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
