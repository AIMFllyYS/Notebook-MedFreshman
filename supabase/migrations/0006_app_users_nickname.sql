-- 账户展示昵称。头像只存客户端，不进这张表。
-- 档位 / 周期仍只许 service_role 写；昵称走 security definer RPC，
-- 避免重新打开 app_users 的通用 UPDATE。

alter table public.app_users
  add column if not exists nickname text;

comment on column public.app_users.nickname is
  '展示昵称。空则客户端用邮箱 @ 前缀。头像不入库。';

create or replace function public.update_own_nickname(next_nickname text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  cleaned text;
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  cleaned := nullif(btrim(coalesce(next_nickname, '')), '');
  if cleaned is not null and char_length(cleaned) > 40 then
    raise exception 'nickname too long';
  end if;

  update public.app_users
     set nickname = cleaned
   where id = uid;

  if not found then
    raise exception 'profile missing';
  end if;

  return cleaned;
end;
$$;

revoke all on function public.update_own_nickname(text) from public, anon;
grant execute on function public.update_own_nickname(text) to authenticated;
