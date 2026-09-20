-- 对话分享：独立表 + 独立公开读通道（Agent 工作区的分享入口 + /s/ 公开只读页）。
--
-- 为什么不复用 sync_documents：那张表的 RLS 是 all_own，只有本人能读；而分享的本质
-- 是「让没登录的陌生人读一条对话」。若把公开读塞进同一张表，就必须放宽那条 policy，
-- 等于给 anon 打开扫描全部同步数据的门。这里另起一张表：客户端对表零直接访问，
-- 公开读只走一个 security definer 函数，返回列写死为 (title, payload, created_at)。
--
-- 与客户端 lib/share/types.ts 的 SharedConversationSnapshot 对齐：payload 在服务端
-- 已用 sanitizeChatMessages() 剥掉媒体，落库前还会用 payloadLooksUnsafe() 复核一次——
-- 库里永远不会出现 base64 / data URL。图片因此不随分享走，公开页在图片位置显示占位。
--
-- 本文件对空库与已应用库都可重放（IF NOT EXISTS / DROP IF EXISTS + OR REPLACE）。

create table if not exists public.shared_conversations (
  id               text primary key,
  owner_id         uuid not null references public.app_users (id) on delete cascade,
  source_client_id text not null,
  title            text not null,
  payload          jsonb not null,
  created_at       timestamptz not null default now(),
  revoked_at       timestamptz,
  expires_at       timestamptz
);

comment on table public.shared_conversations is '对话分享快照。owner_id 只用于归属与撤回；公开读不走 RLS 而走 get_shared_conversation()。';
comment on column public.shared_conversations.source_client_id is '来源会话在客户端的 id（与 sync_documents.client_id 同源），只用于溯源，不参与鉴权。';
comment on column public.shared_conversations.revoked_at is '撤回时间。非空即不再可读，行保留（链接失效但对话不丢）。';
comment on column public.shared_conversations.expires_at is '可选过期时间，为空表示长期有效。公开函数按 now() 比较，过期与撤回一样返回零行。';

-- 索引：owner 的分享列表按时间倒序；第二只给「按时间扫过期 / 清理」用。
create index if not exists shared_conversations_owner_created_idx on public.shared_conversations (owner_id, created_at desc);
create index if not exists shared_conversations_created_idx on public.shared_conversations (created_at desc);

-- ─────────────────────────────────────────────────────────────
-- 公开读：唯一对外通道
--   security definer 让函数以属主身份读表，调用者（anon）因此不需要任何表级权限；
--   revoked_at / expires_at 的过滤写死在函数体内，调用方绕不过去。
--   过期与已撤回都返回零行（契约只有三列、不区分原因，前端统一显示「不存在或已撤回」）。
-- ─────────────────────────────────────────────────────────────
create or replace function public.get_shared_conversation(p_id text)
returns table (title text, payload jsonb, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select s.title, s.payload, s.created_at
  from public.shared_conversations s
  where s.id = p_id
    and s.revoked_at is null
    and (s.expires_at is null or s.expires_at > now());
$$;

revoke all on function public.get_shared_conversation(text) from public;
grant execute on function public.get_shared_conversation(text) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- RLS：owner 全权（insert / select / update / delete 各一条）。
--   写入实际走服务端 service_role（绕过 RLS）；这几条是行级兜底：即便将来有人
--   在浏览器用 anon/authenticated client 直接读写，也只能碰自己的分享。
-- ─────────────────────────────────────────────────────────────
alter table public.shared_conversations enable row level security;

drop policy if exists shared_conversations_select_own on public.shared_conversations;
create policy shared_conversations_select_own on public.shared_conversations
  for select to authenticated using ((select auth.uid()) = owner_id);

drop policy if exists shared_conversations_insert_own on public.shared_conversations;
create policy shared_conversations_insert_own on public.shared_conversations
  for insert to authenticated with check ((select auth.uid()) = owner_id);

drop policy if exists shared_conversations_update_own on public.shared_conversations;
create policy shared_conversations_update_own on public.shared_conversations
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists shared_conversations_delete_own on public.shared_conversations;
create policy shared_conversations_delete_own on public.shared_conversations
  for delete to authenticated using ((select auth.uid()) = owner_id);

-- anon 刻意不建任何 policy：RLS 开启且无 policy = 客户端零访问（同 0001 里
-- redemption_codes 的口径）。公开读走上面的 security definer 函数，不需要 policy。

-- ─────────────────────────────────────────────────────────────
-- 表级授权
--   照 0001 的口径：表级 grant 只是打开大门，真正的行级管控在 RLS。
--   但 anon 连表级权限也不给——公开读不需要它（函数以属主身份读表）。
--   顺带收回 0001 里 alter default privileges 给新表带来的 truncate / references /
--   trigger：truncate 不受 RLS 保护，而这张表是准备给全网读的，权限面收得比既有表紧。
-- ─────────────────────────────────────────────────────────────
revoke all on table public.shared_conversations from anon;
revoke all on table public.shared_conversations from authenticated;
revoke all on table public.shared_conversations from service_role;
grant select, insert, update, delete on table public.shared_conversations to authenticated, service_role;
