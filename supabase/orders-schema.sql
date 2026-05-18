-- ============================================
-- Orders Table — run in Supabase SQL Editor
-- ============================================

create table public.orders (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  user_email  text not null,
  user_name   text,

  -- Plan details
  plan_id     text not null,
  plan_name   text not null,
  plan_term   text not null,
  connections int  not null,
  price       numeric not null,

  -- Status flow: pending → invoiced → active → cancelled
  status      text not null default 'pending',

  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.orders enable row level security;

-- Customers can only see their own orders
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- Authenticated users can insert their own orders
-- (the API route uses the service_role key which bypasses RLS entirely,
--  but this policy ensures it also works if called as the user directly)
create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Only service role can update/delete (bypasses RLS automatically)
-- No explicit policy needed — service_role key skips RLS by default.

-- Auto-update timestamp
create trigger on_order_updated
  before update on public.orders
  for each row execute procedure public.handle_updated_at();
