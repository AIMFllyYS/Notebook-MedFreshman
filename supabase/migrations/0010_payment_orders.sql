-- 0010_payment_orders.sql
-- 支付订单表：一单对应一次 provider 托管收银（Creem 一期，预留 alipay）。
-- 履约语义：status pending →（webhook 验签 + 幂等校验）→ paid，同时把额度写进 quota_grants。

create table if not exists public.payment_orders (
  id                   uuid         primary key default gen_random_uuid(),
  user_id              uuid         not null references public.app_users(id) on delete cascade,
  provider             text         not null check (provider in ('creem', 'alipay')),
  plan                 text         not null,
  tier                 text         not null check (tier in ('plus', 'pro')),
  months               integer      not null check (months >= 1),
  amount_cents         integer      not null check (amount_cents >= 0),
  currency             text         not null default 'USD',
  status               text         not null default 'pending'
                       check (status in ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  provider_checkout_id text,
  provider_order_id    text,
  metadata             jsonb        not null default '{}'::jsonb,
  created_at           timestamptz  not null default now(),
  paid_at              timestamptz
);

create index if not exists payment_orders_user_idx on public.payment_orders (user_id, created_at desc);

-- provider_order_id 是上游订单号：同一笔支付重投 webhook 只能命中一次（防重放）。
create unique index if not exists payment_orders_provider_order_uidx
  on public.payment_orders (provider, provider_order_id)
  where provider_order_id is not null;

alter table public.payment_orders enable row level security;

drop policy if exists payment_orders_select_own on public.payment_orders;
create policy payment_orders_select_own on public.payment_orders
  for select to authenticated using (auth.uid() = user_id);

grant select on public.payment_orders to authenticated;
grant all on public.payment_orders to service_role;

-- 支付来源的额度发放走与兑换码相同的 quota_grants 通道，source 放宽加 'payment'。
alter table public.quota_grants drop constraint if exists quota_grants_source_check;
alter table public.quota_grants
  add constraint quota_grants_source_check check (source in ('signup', 'redemption', 'manual', 'payment'));
