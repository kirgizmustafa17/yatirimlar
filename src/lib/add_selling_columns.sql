-- Add selling columns and status for tracking sales
alter table investments add column if not exists selling_price numeric;
alter table investments add column if not exists selling_date timestamp with time zone;
alter table investments add column if not exists status text default 'active' check (status in ('active', 'sold'));
