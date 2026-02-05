-- Trading Journal schema (Supabase Postgres)
-- Run in Supabase SQL Editor.

-- Enable uuid extension if not already
create extension if not exists "uuid-ossp";

-- Trades
create table if not exists public.trades (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,

  market text not null,            -- e.g. crypto/forex/stocks/options
  symbol text not null,            -- e.g. BTCUSDT, EURUSD, AAPL
  direction text not null check (direction in ('long','short')),

  entry_time timestamptz,
  exit_time timestamptz,
  entry_price numeric,
  exit_price numeric,
  size numeric,
  fees numeric,

  pnl numeric,                     -- optional manual override
  r_multiple numeric,              -- optional

  setup text,                      -- strategy/setup name
  tags text[] default '{}'::text[],
  notes text,

  mood integer check (mood between 1 and 5),
  sleep_hours numeric,
  rule_breaks text[] default '{}'::text[],

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trade screenshots (metadata)
create table if not exists public.trade_screenshots (
  id uuid primary key default uuid_generate_v4(),
  trade_id uuid not null references public.trades(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,

  path text not null,               -- storage object path
  caption text,

  created_at timestamptz not null default now()
);

create index if not exists trade_screenshots_trade_id_idx on public.trade_screenshots(trade_id, created_at asc);
create index if not exists trade_screenshots_user_id_idx on public.trade_screenshots(user_id, created_at desc);

create index if not exists trades_user_id_created_at_idx on public.trades(user_id, created_at desc);

-- Updated-at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_trades_updated_at on public.trades;
create trigger set_trades_updated_at
before update on public.trades
for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.trades enable row level security;
alter table public.trade_screenshots enable row level security;

drop policy if exists "trades_select_own" on public.trades;
create policy "trades_select_own" on public.trades
for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "trades_insert_own" on public.trades;
create policy "trades_insert_own" on public.trades
for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "trades_update_own" on public.trades;
create policy "trades_update_own" on public.trades
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "trades_delete_own" on public.trades;
create policy "trades_delete_own" on public.trades
for delete to authenticated
using (auth.uid() = user_id);

-- trade_screenshots RLS

drop policy if exists "trade_screenshots_select_own" on public.trade_screenshots;
create policy "trade_screenshots_select_own" on public.trade_screenshots
for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "trade_screenshots_insert_own" on public.trade_screenshots;
create policy "trade_screenshots_insert_own" on public.trade_screenshots
for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "trade_screenshots_delete_own" on public.trade_screenshots;
create policy "trade_screenshots_delete_own" on public.trade_screenshots
for delete to authenticated
using (auth.uid() = user_id);

-- Storage bucket + policies (run once)
-- In Supabase Dashboard → Storage: create a bucket named "trade-screenshots" and set it to PRIVATE.
-- Then run the policies below.

-- Note: These policies assume paths like: user_id/trade_id/filename.jpg

drop policy if exists "trade_screenshots_storage_read_own" on storage.objects;
create policy "trade_screenshots_storage_read_own" on storage.objects
for select to authenticated
using (
  bucket_id = 'trade-screenshots'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "trade_screenshots_storage_write_own" on storage.objects;
create policy "trade_screenshots_storage_write_own" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'trade-screenshots'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "trade_screenshots_storage_delete_own" on storage.objects;
create policy "trade_screenshots_storage_delete_own" on storage.objects
for delete to authenticated
using (
  bucket_id = 'trade-screenshots'
  and split_part(name, '/', 1) = auth.uid()::text
);
