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

-- Only service role can insert/update
create policy "Service role manages orders"
  on public.orders for all
  using (auth.role() = 'service_role');

-- Auto-update timestamp
create trigger on_order_updated
  before update on public.orders
  for each row execute procedure public.handle_updated_at();
