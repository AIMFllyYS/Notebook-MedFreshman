-- 个人笔记 + 复习闪卡走 sync_documents 真云同步。
-- 同时略抬既有 kind / 账号合计上限，并给笔记、闪卡单独额度池。
-- 与客户端 lib/sync/types.ts 对齐。

alter table public.sync_documents
  drop constraint if exists sync_documents_kind_check;

alter table public.sync_documents
  add constraint sync_documents_kind_check
  check (kind in (
    'chat-session',
    'artifact',
    'settings',
    'skill',
    'document',
    'user-note',
    'review-card'
  ));

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
  user_limit integer := 50331648; -- 48 MB
  pool_total bigint;
  pool_limit integer;
begin
  if new.deleted then
    return new;
  end if;
  payload_bytes := pg_column_size(new.payload);
  kind_limit := case new.kind
    when 'chat-session' then 5242880   -- 5 MB
    when 'artifact' then 1572864       -- 1.5 MB
    when 'document' then 2621440       -- 2.5 MB
    when 'user-note' then 2097152      -- 2 MB
    when 'review-card' then 262144     -- 256 KB
    else 5242880
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

  if new.kind in ('user-note', 'review-card') then
    pool_limit := 20971520; -- 20 MB 独立池
    select coalesce(sum(pg_column_size(payload)), 0) into pool_total
    from public.sync_documents
    where user_id = new.user_id
      and deleted = false
      and kind = new.kind
      and not (client_id = new.client_id);
    if pool_total + payload_bytes > pool_limit then
      raise exception 'sync_pool_limit' using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_documents_byte_limits on public.sync_documents;
create trigger sync_documents_byte_limits
  before insert or update on public.sync_documents
  for each row execute function public.sync_documents_enforce_bytes();
