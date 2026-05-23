-- =====================================================
-- MOVENTRA SAFARIS & LOGISTICS LTD
-- Complete Database Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================================================
-- 1. CLIENTS TABLE
-- =====================================================
create table if not exists clients (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  id_number text unique,
  phone text not null,
  alternative_phone text,
  email text,
  residence text,
  place_of_work text,
  kra_pin text,
  driving_license_number text,
  passport_photo_url text,
  id_photo_url text,
  id_photo_back_url text,
  driving_license_url text,
  driving_license_back_url text,
  fingerprint_left_url text,
  fingerprint_right_url text,
  left_fingerprint text,
  right_fingerprint text,
  next_of_kin_name text,
  next_of_kin_phone text,
  next_of_kin_relationship text,
  total_bookings integer default 0,
  total_spent numeric default 0,
  total_debt numeric default 0,
  last_booking_date date,
  risk_level text default 'low' check (risk_level in ('low','medium','high')),
  notes text,
  client_type text default 'citizen' check (client_type in ('citizen','foreigner')),
  country_of_origin text default 'Kenya',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- 2. BLACKLIST TABLE
-- =====================================================
create table if not exists blacklist (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id),
  client_name text not null,
  id_number text,
  phone text,
  record_type text not null check (record_type in ('theft','fraud','damage','non-payment','accident','drug-related','violent-dangerous','suspicious','other')),
  severity text not null check (severity in ('low','medium','high','critical')),
  status text default 'active' check (status in ('active','resolved','under-review')),
  incident_date date,
  description text,
  evidence_urls text[],
  reported_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- 3. BOOKINGS TABLE
-- =====================================================
create table if not exists bookings (
  id uuid primary key default uuid_generate_v4(),
  booking_ref text unique not null default 'BK-' || upper(substr(uuid_generate_v4()::text, 1, 8)),
  client_id uuid references clients(id),
  service_type text not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  status text default 'pending' check (status in ('pending','confirmed','in-progress','completed','cancelled')),
  payment_status text default 'pending' check (payment_status in ('pending','processing','completed','failed')),
  payment_method text check (payment_method in ('mpesa','bank','cash','cheque')),
  total_amount numeric not null default 0,
  amount_paid numeric default 0,
  balance numeric generated always as (total_amount - amount_paid) stored,
  mpesa_ref text,
  bank_ref text,
  notes text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- 4. FLEET VEHICLES TABLE
-- =====================================================
create table if not exists fleet_vehicles (
  id uuid primary key default uuid_generate_v4(),
  vehicle_name text not null,
  vehicle_make text not null,
  vehicle_model text not null,
  registration_no text unique not null,
  vehicle_type text check (vehicle_type in ('sedan','suv','van','truck','bus','pickup','motorcycle')),
  fuel_type text check (fuel_type in ('petrol','diesel','electric','hybrid')),
  year integer,
  color text,
  ownership_type text default 'own' check (ownership_type in ('own','sublet')),
  supplier_name text,
  supplier_phone text,
  supplier_daily_rate numeric,
  our_daily_rate numeric,
  status text default 'available' check (status in ('available','assigned','maintenance','out-of-service')),
  current_mileage integer,
  last_service_date date,
  next_service_date date,
  next_service_mileage integer,
  service_interval integer,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- 5. INVOICES TABLE
-- =====================================================
create table if not exists invoices (
  id uuid primary key default uuid_generate_v4(),
  invoice_number text unique not null,
  client_id uuid references clients(id),
  customer_name text not null,
  customer_email text,
  customer_phone text,
  customer_address text,
  customer_kra_pin text,
  service_type text not null,
  items jsonb not null default '[]',
  subtotal numeric not null default 0,
  vat_rate numeric default 16,
  vat_amount numeric not null default 0,
  total numeric not null default 0,
  amount_paid numeric default 0,
  payments jsonb default '[]',
  status text default 'draft' check (status in ('draft','sent','paid','partial','overdue','cancelled')),
  issue_date date not null default current_date,
  due_date date not null,
  payment_terms text default 'Net 14',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- 6. RECEIPTS TABLE
-- =====================================================
create table if not exists receipts (
  id uuid primary key default uuid_generate_v4(),
  receipt_number text unique not null,
  invoice_id uuid references invoices(id),
  client_id uuid references clients(id),
  customer_name text not null,
  customer_phone text,
  customer_email text,
  customer_kra_pin text,
  service_type text not null,
  items jsonb not null default '[]',
  subtotal numeric not null default 0,
  tax_amount numeric default 0,
  total_amount numeric not null default 0,
  payment_method text not null,
  transaction_code text,
  bank_name text,
  status text default 'issued' check (status in ('draft','issued','cancelled')),
  etims_receipt_number text,
  etims_device_number text,
  etims_verification_url text,
  issued_at timestamptz default now(),
  issued_by text,
  created_at timestamptz default now()
);

-- =====================================================
-- 7. ACCOUNTS / TRANSACTIONS TABLE
-- =====================================================
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  date date not null default current_date,
  type text not null check (type in ('income','expense')),
  category text not null,
  subcategory text,
  description text not null,
  amount numeric not null,
  payment_method text check (payment_method in ('mpesa','bank','cash','card')),
  reference text,
  customer_name text,
  invoice_number text,
  status text default 'completed' check (status in ('completed','pending','cancelled')),
  linked_booking_id uuid references bookings(id),
  linked_invoice_id uuid references invoices(id),
  created_by text,
  created_at timestamptz default now()
);

-- =====================================================
-- 8. SUBLET ASSETS TABLE
-- =====================================================
create table if not exists sublet_vehicles (
  id uuid primary key default uuid_generate_v4(),
  service_type text not null,
  supplier_name text not null,
  supplier_phone text,
  supplier_email text,
  supplier_type text default 'company' check (supplier_type in ('company','individual')),
  make text not null,
  model text not null,
  registration text not null,
  color text,
  year text,
  supplier_daily_rate numeric not null,
  our_daily_rate numeric not null,
  status text default 'available' check (status in ('available','active','returned')),
  created_at timestamptz default now()
);

create table if not exists sublet_bookings (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid references sublet_vehicles(id),
  client_id uuid references clients(id),
  service_type text not null,
  area_of_use text,
  client_name text not null,
  client_phone text,
  start_date date not null,
  end_date date not null,
  number_of_days integer not null,
  supplier_daily_rate numeric not null,
  our_daily_rate numeric not null,
  total_supplier_cost numeric not null,
  total_client_charge numeric not null,
  expenses jsonb default '[]',
  total_expenses numeric default 0,
  net_profit numeric not null,
  profit_per_day numeric not null,
  status text default 'active' check (status in ('active','completed','cancelled')),
  payment_method text,
  payment_reference text,
  amount_paid numeric default 0,
  notes text,
  created_at timestamptz default now()
);

-- =====================================================
-- 9. FLEET OUT TABLE
-- =====================================================
create table if not exists fleet_out (
  id uuid primary key default uuid_generate_v4(),
  vehicle_make text,
  vehicle_model text,
  vehicle_reg text not null,
  vehicle_color text,
  receiver_name text not null,
  receiver_phone text,
  receiver_email text,
  receiver_type text default 'company' check (receiver_type in ('company','individual')),
  our_daily_rate numeric not null,
  start_date date not null,
  end_date date not null,
  number_of_days integer not null,
  payment_method text,
  payment_reference text,
  amount_paid numeric default 0,
  status text default 'active' check (status in ('active','completed','cancelled')),
  return_condition text,
  follow_up_notes text,
  notes text,
  created_at timestamptz default now()
);

-- =====================================================
-- 10. USERS / STAFF TABLE
-- =====================================================
create table if not exists staff (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique not null,
  phone text,
  role text default 'staff' check (role in ('admin','manager','staff','driver')),
  department text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
alter table clients enable row level security;
alter table blacklist enable row level security;
alter table bookings enable row level security;
alter table fleet_vehicles enable row level security;
alter table invoices enable row level security;
alter table receipts enable row level security;
alter table transactions enable row level security;
alter table sublet_vehicles enable row level security;
alter table sublet_bookings enable row level security;
alter table fleet_out enable row level security;
alter table staff enable row level security;

-- Allow authenticated users full access (admin app)
create policy "Authenticated users full access" on clients for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on blacklist for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on bookings for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on fleet_vehicles for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on invoices for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on receipts for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on transactions for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on sublet_vehicles for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on sublet_bookings for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on fleet_out for all using (auth.role() = 'authenticated');
create policy "Authenticated users full access" on staff for all using (auth.role() = 'authenticated');

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on clients for each row execute function update_updated_at();
create trigger set_updated_at before update on bookings for each row execute function update_updated_at();
create trigger set_updated_at before update on fleet_vehicles for each row execute function update_updated_at();
create trigger set_updated_at before update on invoices for each row execute function update_updated_at();
create trigger set_updated_at before update on staff for each row execute function update_updated_at();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
create index idx_clients_phone on clients(phone);
create index idx_clients_id_number on clients(id_number);
create index idx_clients_kra_pin on clients(kra_pin);
create index idx_bookings_client on bookings(client_id);
create index idx_bookings_status on bookings(status);
create index idx_bookings_service on bookings(service_type);
create index idx_invoices_client on invoices(client_id);
create index idx_invoices_status on invoices(status);
create index idx_transactions_date on transactions(date);
create index idx_transactions_type on transactions(type);
create index idx_blacklist_id_number on blacklist(id_number);
create index idx_blacklist_phone on blacklist(phone);
