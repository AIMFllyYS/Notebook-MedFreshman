-- StudyReview-Platform 账号与额度地基（E1 基线）
--
-- 通过 `pnpm db:migrate` 应用。本文件对空库与已应用库都可重放（IF NOT EXISTS /
-- DROP IF EXISTS），重复执行由 runner 的 schema_migrations 版本表跳过。
--
-- 设计要点：
--   1. 两个额度池。platform 池承载平台模型消耗（Free ¥7 / Plus ¥70 / Pro ¥700，月度）；
--      byok 池独立承载 BYOK 用户的平台侧开销（联网搜索 / 搜图 / 嵌入 / 重排 / 标题生成），
--      按 token 量 × 固定费率计量。主池耗尽时只硬阻断平台模型，BYOK 侧仍可继续。
--   2. 台账一律记人民币（numeric），美元只是展示层按汇率换算。
--   3. 周期是「滚动 30 天」，锚点为各用户自己的开通/兑换日，不是自然月 1 号。
--   4. 台账与额度授予对客户端只读，写入必须走 service_role。客户端能改的只有
--      自己的同步文档。

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- 用户档案：扩展 auth.users
-- ─────────────────────────────────────────────────────────────
create table if not exists public.app_users (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text,
  tier          text        not null default 'free' check (tier in ('free', 'plus', 'pro')),
  period_start  timestamptz not null default now(),
  period_end    timestamptz not null default (now() + interval '30 days'),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.app_users is '用户档案。period_* 为滚动 30 天额度周期，锚点是各自的开通/兑换日。';

-- ─────────────────────────────────────────────────────────────
-- 额度授予：注册默认额度或兑换码发放
-- ─────────────────────────────────────────────────────────────
create table if not exists public.quota_grants (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid        not null references public.app_users (id) on delete cascade,
  pool          text        not null default 'platform' check (pool in ('platform', 'byok')),
  tier          text        not null check (tier in ('free', 'plus', 'pro')),
  amount_cny    numeric(12, 4) not null check (amount_cny >= 0),
  period_start  timestamptz not null,
  period_end    timestamptz not null,
  source        text        not null check (source in ('signup', 'redemption', 'manual')),
  redemption_id uuid,
  created_at    timestamptz not null default now(),
  constraint quota_grants_period_valid check (period_end > period_start)
);

create index if not exists quota_grants_user_period_idx on public.quota_grants (user_id, pool, period_end desc);

-- ─────────────────────────────────────────────────────────────
-- 用量台账：服务端权威账本
--   selected_model_id 是用户菜单里选的；actual_model_id 是 failover 或生图模式
--   换模后真正打到的上游模型。审计发现二者不一致会导致按错单价计费，故分列存储。
-- ─────────────────────────────────────────────────────────────
create table if not exists public.usage_ledger (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid        not null references public.app_users (id) on delete cascade,
  occurred_at        timestamptz not null default now(),
  pool               text        not null check (pool in ('platform', 'byok')),
  route              text        not null,
  kind               text        not null check (kind in ('llm', 'image', 'embedding', 'rerank', 'web-search', 'image-search')),
  selected_model_id  text,
  actual_model_id    text,
  prompt_tokens      bigint      not null default 0,
  completion_tokens  bigint      not null default 0,
  cached_tokens      bigint      not null default 0,
  reasoning_tokens   bigint      not null default 0,
  cache_write_tokens bigint      not null default 0,
  image_count        integer     not null default 0,
  cost_cny           numeric(12, 6) not null default 0,
  session_id         text,
  request_id         text,
  meta               jsonb       not null default '{}'::jsonb
);

create index if not exists usage_ledger_user_time_idx on public.usage_ledger (user_id, occurred_at desc);
create index if not exists usage_ledger_user_pool_time_idx on public.usage_ledger (user_id, pool, occurred_at desc);
create index if not exists usage_ledger_request_idx on public.usage_ledger (request_id) where request_id is not null;

comment on column public.usage_ledger.selected_model_id is '用户在菜单里选中的模型 id。';
comment on column public.usage_ledger.actual_model_id is 'failover 或生图模式换模后真实调用的上游模型 id，计价以此为准。';

-- ─────────────────────────────────────────────────────────────
-- 兑换码：单码多用 + 数量上限。max_uses = 1 即等价于单码单用。
--   无后台面板，由运维直接写库或用脚本批量生成。
-- ─────────────────────────────────────────────────────────────
create table if not exists public.redemption_codes (
  id         uuid primary key default gen_random_uuid(),
  code       text        not null unique,
  tier       text        not null check (tier in ('free', 'plus', 'pro')),
  months     integer     not null default 1 check (months >= 1),
  max_uses   integer     not null default 1 check (max_uses >= 1),
  used_count integer     not null default 0 check (used_count >= 0),
  expires_at timestamptz,
  note       text,
  created_at timestamptz not null default now(),
  constraint redemption_codes_within_max check (used_count <= max_uses)
);

create table if not exists public.redemptions (
  id          uuid primary key default gen_random_uuid(),
  code_id     uuid        not null references public.redemption_codes (id) on delete cascade,
  user_id     uuid        not null references public.app_users (id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  unique (code_id, user_id)
);

-- ─────────────────────────────────────────────────────────────
-- 云端同步：只放小体积用户数据（对话纯文本、artifact 产物）。
--   明确不同步：用户上传的图片（留在 IndexedDB 的 chat-blob:*）、任何笔记内容。
-- ─────────────────────────────────────────────────────────────
create table if not exists public.sync_documents (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid        not null references public.app_users (id) on delete cascade,
  kind       text        not null check (kind in ('chat-session', 'artifact', 'settings', 'skill')),
  client_id  text        not null,
  payload    jsonb       not null,
  deleted    boolean     not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, kind, client_id)
);

create index if not exists sync_documents_user_kind_idx on public.sync_documents (user_id, kind, updated_at desc);

-- ─────────────────────────────────────────────────────────────
-- updated_at 自动维护
-- ─────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists app_users_touch on public.app_users;
create trigger app_users_touch
  before update on public.app_users
  for each row execute function public.touch_updated_at();

drop trigger if exists sync_documents_touch on public.sync_documents;
create trigger sync_documents_touch
  before update on public.sync_documents
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 注册时自动建档 + 发放 Free 档首月额度
-- ─────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_start timestamptz := now();
  v_end   timestamptz := now() + interval '30 days';
begin
  insert into public.app_users (id, email, tier, period_start, period_end)
  values (new.id, new.email, 'free', v_start, v_end)
  on conflict (id) do nothing;

  insert into public.quota_grants (user_id, pool, tier, amount_cny, period_start, period_end, source)
  values (new.id, 'platform', 'free', 7.0000, v_start, v_end, 'signup');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- RLS：anon key 会进浏览器，数据库的安全边界完全落在这里。
--   台账与额度对客户端只读；兑换码对客户端完全不可见。
-- ─────────────────────────────────────────────────────────────
alter table public.app_users        enable row level security;
alter table public.quota_grants     enable row level security;
alter table public.usage_ledger     enable row level security;
alter table public.redemption_codes enable row level security;
alter table public.redemptions      enable row level security;
alter table public.sync_documents   enable row level security;

drop policy if exists app_users_select_own on public.app_users;
create policy app_users_select_own on public.app_users
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists app_users_update_own on public.app_users;
create policy app_users_update_own on public.app_users
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists quota_grants_select_own on public.quota_grants;
create policy quota_grants_select_own on public.quota_grants
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists usage_ledger_select_own on public.usage_ledger;
create policy usage_ledger_select_own on public.usage_ledger
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists redemptions_select_own on public.redemptions;
create policy redemptions_select_own on public.redemptions
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists sync_documents_all_own on public.sync_documents;
create policy sync_documents_all_own on public.sync_documents
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- redemption_codes 刻意不建任何 policy：RLS 开启且无 policy = 客户端零访问，
-- 只有 service_role（绕过 RLS）能读写。核销必须走服务端接口。

-- ─────────────────────────────────────────────────────────────
-- 表级授权
--   注意：这一段是因为本项目重建过 public schema，Supabase 默认的表级 grant
--   随之丢失，必须显式补回，否则连 service_role 都会拿到 42501。
--   给 anon / authenticated 表级权限是 Supabase 的标准模型——真正的行级管控
--   由上面的 RLS policy 负责，表级 grant 只是打开大门。
-- ─────────────────────────────────────────────────────────────
grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on all tables    in schema public to postgres, anon, authenticated, service_role;
grant all on all sequences in schema public to postgres, anon, authenticated, service_role;
grant all on all functions in schema public to postgres, anon, authenticated, service_role;

alter default privileges in schema public grant all on tables    to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
