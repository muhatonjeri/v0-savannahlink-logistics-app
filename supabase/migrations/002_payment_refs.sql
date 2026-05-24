-- Run this in Supabase SQL Editor
-- Adds payment reference tracking across bookings, transactions, receipts, invoices

-- Bookings: booking reference + payment reference
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_ref        text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_reference  text DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_date       date;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS form_data          jsonb DEFAULT '{}';

-- Transactions: payment reference + booking link
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_reference  text DEFAULT '';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS reference          text DEFAULT '';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS customer_name      text DEFAULT '';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS invoice_number     text DEFAULT '';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS status             text DEFAULT 'completed';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_by         text DEFAULT 'Admin';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS subcategory        text DEFAULT '';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_method     text DEFAULT 'cash';

-- Receipts: link to invoice/booking
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS invoice_ref  text DEFAULT '';
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS booking_ref  text DEFAULT '';

-- Invoices: payment reference  
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_reference  text DEFAULT '';

-- Index for fast lookup by booking_ref
CREATE INDEX IF NOT EXISTS idx_bookings_booking_ref    ON bookings(booking_ref);
CREATE INDEX IF NOT EXISTS idx_transactions_reference  ON transactions(reference);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_ref ON transactions(payment_reference);
