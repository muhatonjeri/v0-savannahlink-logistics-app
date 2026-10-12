-- ══════════════════════════════════════════════════════════════════
-- 009: Corporate invoice fields
-- Fields Kenyan corporate accounts teams match an invoice against
-- before paying: their LPO/PO number, the service period, and the
-- vehicle or route — plus an "Attention" contact for routing.
-- All optional: the invoice only shows a field when it is filled in.
-- Safe to re-run.
-- ══════════════════════════════════════════════════════════════════

alter table invoices add column if not exists customer_attention text;
alter table invoices add column if not exists lpo_number         text;
alter table invoices add column if not exists service_start      date;
alter table invoices add column if not exists service_end        date;
alter table invoices add column if not exists vehicle_route      text;

-- A service can't end before it starts
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'invoices_service_period_check'
  ) then
    alter table invoices
      add constraint invoices_service_period_check
      check (service_start is null or service_end is null or service_end >= service_start);
  end if;
end $$;

-- Accounts teams search invoices by their own LPO number
create index if not exists idx_invoices_lpo_number on invoices (lpo_number);
