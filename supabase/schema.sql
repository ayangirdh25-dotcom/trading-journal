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
