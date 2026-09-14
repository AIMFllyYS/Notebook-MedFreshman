-- 云同步字节托底 + 额度周期 SUM。
-- kind 上限与客户端压缩后的常量对齐：会话 4MB / 演示 1MB / 文档 2MB / 用户合计 32MB。
-- 额度开流前用 SQL 聚合，避免分页扫完整 usage_ledger。

create or replace function public.quota_period_sum(
  p_user_id uuid,
  p_start timestamptz,
  p_end timestamptz
)
returns table(pool text, used numeric)
language sql
stable
security definer
set search_path = public
as $$
  with billed as (
    select
      case
        when coalesce((l.meta->>'countsTowardQuota')::boolean, true) = false then null
        when l.kind in ('embedding', 'rerank', 'web-search', 'image-search') then l.pool
        when coalesce(l.meta->>'source', '') in ('chat-title', 'webSearch', 'imageSearch', 'embedding', 'rerank') then l.pool
        when l.pool = 'byok' then null
        else 'platform'
      end as billed_pool,
      l.cost_cny
    from public.usage_ledger l
    where l.user_id = p_user_id
      and l.occurred_at >= p_start
      and l.occurred_at < p_end
  )
  select billed_pool as pool, coalesce(sum(cost_cny), 0) as used
  from billed
  where billed_pool is not null
  group by billed_pool;
$$;

revoke all on function public.quota_period_sum(uuid, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.quota_period_sum(uuid, timestamptz, timestamptz) to service_role;

create or replace function public.sync_documents_enforce_bytes()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  payload_bytes integer;
  kind_limit integer;
  user_total bigint;
  user_limit integer := 33554432;
begin
  if new.deleted then
    return new;
  end if;
  payload_bytes := pg_column_size(new.payload);
  kind_limit := case new.kind
    when 'chat-session' then 4194304
    when 'artifact' then 1048576
    when 'document' then 2097152
    else 4194304
  end;
  if payload_bytes > kind_limit then
    raise exception 'sync_kind_limit' using errcode = 'P0001';
  end if;
  select coalesce(sum(pg_column_size(payload)), 0) into user_total
  from public.sync_documents
  where user_id = new.user_id
    and deleted = false
    and not (kind = new.kind and client_id = new.client_id);
  if user_total + payload_bytes > user_limit then
    raise exception 'sync_user_limit' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists sync_documents_byte_limits on public.sync_documents;
create trigger sync_documents_byte_limits
  before insert or update on public.sync_documents
  for each row execute function public.sync_documents_enforce_bytes();
