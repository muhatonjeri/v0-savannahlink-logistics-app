-- ══════════════════════════════════════════════════════════════════
-- 010: Service period on receipts
-- The dates the paid-for service ran (e.g. car hire 12–15 Oct).
-- Optional; copied from the invoice when a receipt pays one.
-- Safe to re-run.
-- ══════════════════════════════════════════════════════════════════

alter table receipts add column if not exists service_start date;
alter table receipts add column if not exists service_end   date;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'receipts_service_period_check'
  ) then
    alter table receipts
      add constraint receipts_service_period_check
      check (service_start is null or service_end is null or service_end >= service_start);
  end if;
end $$;
