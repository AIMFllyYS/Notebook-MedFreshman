-- 对话项目（会话分组的名字）走 sync_documents.kind = 'chat-project'。
-- 项目只有名字与时间戳，32 KB 足够；成员归属仍跟着每条 chat-session 的 meta.folderId 走，
-- 也就是说：云端只想让「项目名」跨设备可见，不为它单开一张表。
-- 与客户端 lib/sync/types.ts 对齐；没跑这条迁移时客户端会降级为「只留本机 + 提示一次」。

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
    'review-card',
    'chat-project'
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
    when 'chat-project' then 32768     -- 32 KB
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
