-- Agent 定时任务的云端同步预留：走 sync_documents.kind = 'scheduled-task'。
-- 当前客户端把任务定义与运行历史都留在本机 IndexedDB（PERSIST_KEYS.scheduledTasks），
-- 调度器也是前台常驻；这张 kind 只为后续「任务跨设备可见 / 服务端执行器」预留——
-- 真上云时 payload 直接装 ScheduledTask 序列化结果，不另开表。
-- 与 0007 chat-project 同理：单条任务很小，64 KB 上限覆盖 prompt + 20 条 runHistory。
-- 与客户端 lib/sync/types.ts / lib/stores/scheduledTasks.ts 对齐；
-- 没跑这条迁移时客户端继续走「只留本机」，行为不变。

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
    'chat-project',
    'scheduled-task'
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
    when 'scheduled-task' then 65536   -- 64 KB：prompt 加上最多 20 条 runHistory
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
