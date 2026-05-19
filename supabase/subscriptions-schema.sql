-- ============================================================
-- Subscriptions Table — run in Supabase SQL Editor
-- Populated by admin after payment is confirmed.
-- ============================================================

create table public.subscriptions (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references auth.users(id) on delete cascade not null,

  -- Plan details (mirrors the order)
  plan_name        text not null,
  plan_term        text not null,
  connections      int  not null,

  -- Status: active | trial | expired | suspended
  status           text not null default 'active',

  -- Subscription window
  start_date       date not null default current_date,
  end_date         date,

  -- IPTV credentials (filled in by admin)
  iptv_server_url  text,
  iptv_username    text,
  iptv_password    text,

  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

alter table public.subscriptions enable row level security;

-- Users can only read their own subscription
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Only service role (admin) can insert/update/delete
-- The service_role key bypasses RLS automatically — no explicit policy needed.

-- Auto-update timestamp (requires handle_updated_at function)
create trigger on_subscription_updated
  before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();
