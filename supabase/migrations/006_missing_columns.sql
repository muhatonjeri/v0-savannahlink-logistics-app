-- =====================================================================
-- Migration 006: Missing columns + blacklist table
-- Run in Supabase SQL Editor after previous migrations
-- =====================================================================

-- Add missing columns to clients that register-client page sends
alter table clients add column if not exists nationality text default 'Kenyan';
alter table clients add column if not exists id_type text default 'national_id'
  check (id_type in ('national_id','passport','alien_id','military_id'));
alter table clients add column if not exists alternative_phone text;
alter table clients add column if not exists next_of_kin_relationship text;
alter table clients add column if not exists fingerprint_right_url text;
alter table clients add column if not exists fingerprint_left_url text;

-- Blacklist table (used by admin/blacklist page)
create table if not exists blacklist (
  id uuid primary key default uuid_generate_v4(),
  client_name text not null,
  id_number text,
  phone text,
  email text,
  record_type text not null default 'other'
    check (record_type in ('theft','fraud','damage','non-payment','accident','drug-related','violent-dangerous','suspicious','other')),
  severity text not null default 'medium'
    check (severity in ('low','medium','high','critical')),
  status text not null default 'active'
    check (status in ('active','under-review','resolved')),
  description text,
  incident_date date,
  reported_by text default 'Admin',
  vehicle_involved text,
  amount_owed numeric(12,2),
  police_report_number text,
  residence text,
  driving_license_number text,
  kra_pin text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for blacklist
alter table blacklist enable row level security;
create policy if not exists "Admin full access to blacklist"
  on blacklist for all using (auth.role() = 'authenticated');

-- Bookings: add missing metadata column
alter table bookings add column if not exists metadata jsonb default '{}'::jsonb;
alter table bookings add column if not exists amount_paid numeric(12,2) default 0;

-- Transactions: add missing columns
alter table transactions add column if not exists customer_name text;
alter table transactions add column if not exists invoice_id uuid references invoices(id) on delete set null;

-- Updated_at trigger for blacklist
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists blacklist_updated_at on blacklist;
create trigger blacklist_updated_at before update on blacklist
  for each row execute function update_updated_at();

-- Indexes for common queries
create index if not exists idx_blacklist_client_name on blacklist(client_name);
create index if not exists idx_blacklist_id_number   on blacklist(id_number);
create index if not exists idx_blacklist_phone        on blacklist(phone);
create index if not exists idx_blacklist_status       on blacklist(status);
create index if not exists idx_clients_phone          on clients(phone);
create index if not exists idx_bookings_service_type  on bookings(service_type);
create index if not exists idx_bookings_status        on bookings(status);
