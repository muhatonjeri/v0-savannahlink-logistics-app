-- ═══════════════════════════════════════════════════════════════════════
-- MIGRATION 007: Go-Live Verification & Cleanup
-- Run AFTER migrations 001-006 in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Ensure uuid extension is enabled
create extension if not exists "uuid-ossp";

-- 2. Add any missing columns that pages reference
alter table clients add column if not exists full_name text;
alter table clients add column if not exists alternative_phone text;
alter table clients add column if not exists id_type text default 'national_id';
alter table clients add column if not exists nationality text default 'Kenyan';
alter table clients add column if not exists next_of_kin_relationship text;
alter table clients add column if not exists passport_photo_url text;
alter table clients add column if not exists id_photo_url text;
alter table clients add column if not exists id_photo_back_url text;
alter table clients add column if not exists driving_license_url text;
alter table clients add column if not exists fingerprint_right_url text;
alter table clients add column if not exists fingerprint_left_url text;
alter table clients add column if not exists notes text;
alter table clients add column if not exists risk_level text default 'low' check (risk_level in ('low','medium','high'));
alter table clients add column if not exists total_bookings integer default 0;
alter table clients add column if not exists total_spent numeric(14,2) default 0;

-- 3. Bookings table additions
alter table bookings add column if not exists booking_ref text;
alter table bookings add column if not exists metadata jsonb default '{}'::jsonb;
alter table bookings add column if not exists amount_paid numeric(12,2) default 0;
alter table bookings add column if not exists payment_method text;
alter table bookings add column if not exists notes text;

-- 4. Invoices additions
alter table invoices add column if not exists service_type text;
alter table invoices add column if not exists amount_paid numeric(12,2) default 0;
alter table invoices add column if not exists customer_name text;
alter table invoices add column if not exists customer_phone text;
alter table invoices add column if not exists customer_email text;

-- 5. Receipts additions  
alter table receipts add column if not exists service_type text;
alter table receipts add column if not exists payment_method text;
alter table receipts add column if not exists issued_at timestamptz default now();

-- 6. Transactions additions
alter table transactions add column if not exists customer_name text;
alter table transactions add column if not exists invoice_id uuid references invoices(id) on delete set null;

-- 7. Fleet additions
alter table fleet_vehicles add column if not exists status text default 'available' check (status in ('available','rented','maintenance','retired'));
alter table fleet_vehicles add column if not exists fuel_type text default 'petrol';
alter table fleet_vehicles add column if not exists seats integer default 5;
alter table fleet_vehicles add column if not exists daily_rate numeric(10,2);
alter table fleet_vehicles add column if not exists image_url text;

-- 8. Staff additions
alter table staff add column if not exists role text default 'staff' check (role in ('admin','manager','staff','driver'));
alter table staff add column if not exists status text default 'active' check (status in ('active','inactive','suspended'));
alter table staff add column if not exists avatar_url text;
alter table staff add column if not exists hire_date date;

-- 9. Blacklist table (if not exists from 006)
create table if not exists blacklist (
  id uuid primary key default uuid_generate_v4(),
  client_name text not null,
  id_number text,
  phone text,
  record_type text default 'other',
  severity text default 'medium' check (severity in ('low','medium','high','critical')),
  status text default 'active' check (status in ('active','under-review','resolved')),
  description text,
  incident_date date,
  reported_by text default 'Admin',
  vehicle_involved text,
  amount_owed numeric(12,2),
  police_report_number text,
  residence text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10. RLS — ensure all tables have it enabled
alter table clients         enable row level security;
alter table blacklist       enable row level security;
alter table bookings        enable row level security;
alter table invoices        enable row level security;
alter table receipts        enable row level security;
alter table transactions    enable row level security;
alter table fleet_vehicles  enable row level security;
alter table staff           enable row level security;
alter table sublet_vehicles enable row level security;
alter table sublet_bookings enable row level security;
alter table fleet_out       enable row level security;

-- 11. RLS Policies — authenticated users have full access (service role bypasses RLS)
do $$ begin
  -- clients
  if not exists (select 1 from pg_policies where tablename='clients' and policyname='auth_all_clients') then
    create policy "auth_all_clients" on clients for all using (auth.role()='authenticated');
  end if;
  -- blacklist
  if not exists (select 1 from pg_policies where tablename='blacklist' and policyname='auth_all_blacklist') then
    create policy "auth_all_blacklist" on blacklist for all using (auth.role()='authenticated');
  end if;
  -- bookings
  if not exists (select 1 from pg_policies where tablename='bookings' and policyname='auth_all_bookings') then
    create policy "auth_all_bookings" on bookings for all using (auth.role()='authenticated');
  end if;
  -- invoices
  if not exists (select 1 from pg_policies where tablename='invoices' and policyname='auth_all_invoices') then
    create policy "auth_all_invoices" on invoices for all using (auth.role()='authenticated');
  end if;
  -- receipts
  if not exists (select 1 from pg_policies where tablename='receipts' and policyname='auth_all_receipts') then
    create policy "auth_all_receipts" on receipts for all using (auth.role()='authenticated');
  end if;
  -- transactions
  if not exists (select 1 from pg_policies where tablename='transactions' and policyname='auth_all_transactions') then
    create policy "auth_all_transactions" on transactions for all using (auth.role()='authenticated');
  end if;
  -- fleet_vehicles
  if not exists (select 1 from pg_policies where tablename='fleet_vehicles' and policyname='auth_all_fleet') then
    create policy "auth_all_fleet" on fleet_vehicles for all using (auth.role()='authenticated');
  end if;
  -- staff
  if not exists (select 1 from pg_policies where tablename='staff' and policyname='auth_all_staff') then
    create policy "auth_all_staff" on staff for all using (auth.role()='authenticated');
  end if;
end $$;

-- 12. Booking reference auto-generator
create or replace function generate_booking_ref()
returns trigger language plpgsql as $$
begin
  if new.booking_ref is null then
    new.booking_ref := 'BK-' || upper(substring(encode(uuid_generate_v4()::text::bytea, 'hex') from 1 for 8));
  end if;
  return new;
end; $$;

drop trigger if exists booking_ref_trigger on bookings;
create trigger booking_ref_trigger
  before insert on bookings
  for each row execute function generate_booking_ref();

-- 13. Auto-update clients.total_bookings on new booking
create or replace function update_client_totals()
returns trigger language plpgsql as $$
begin
  update clients
  set
    total_bookings = (select count(*) from bookings where customer_phone = new.customer_phone),
    total_spent    = (select coalesce(sum(total_amount),0) from bookings where customer_phone = new.customer_phone and status='completed')
  where phone = new.customer_phone;
  return new;
end; $$;

drop trigger if exists client_totals_trigger on bookings;
create trigger client_totals_trigger
  after insert or update on bookings
  for each row execute function update_client_totals();

-- 14. Indexes for performance
create index if not exists idx_clients_phone        on clients(phone);
create index if not exists idx_clients_id_number    on clients(id_number);
create index if not exists idx_clients_full_name    on clients(full_name);
create index if not exists idx_bookings_phone       on bookings(customer_phone);
create index if not exists idx_bookings_service     on bookings(service_type);
create index if not exists idx_bookings_status      on bookings(status);
create index if not exists idx_bookings_created     on bookings(created_at desc);
create index if not exists idx_invoices_status      on invoices(status);
create index if not exists idx_invoices_due         on invoices(due_date);
create index if not exists idx_blacklist_id         on blacklist(id_number);
create index if not exists idx_blacklist_phone      on blacklist(phone);
create index if not exists idx_blacklist_name       on blacklist(client_name);

-- ✓ Run complete. Your database is ready for production.
