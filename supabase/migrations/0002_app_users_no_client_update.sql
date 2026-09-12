-- 收紧 app_users：登录用户不得用 anon key 改档位 / 周期。
-- RLS policy 不能限制列，0001 又 grant all 给 authenticated，因此
-- app_users_update_own 等于允许 `update app_users set tier='pro'`.
-- 档位与周期只许 service_role 写；客户端只保留 SELECT。

drop policy if exists app_users_update_own on public.app_users;

revoke insert, update, delete, truncate on public.app_users from anon, authenticated;
