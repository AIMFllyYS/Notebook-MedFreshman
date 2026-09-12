-- writeDocument 产物走 sync_documents.kind = 'document'。
-- settings / skill 仍在枚举里，本 loop 客户端不同步；生图会话不上云。

alter table public.sync_documents
  drop constraint if exists sync_documents_kind_check;

alter table public.sync_documents
  add constraint sync_documents_kind_check
  check (kind in ('chat-session', 'artifact', 'settings', 'skill', 'document'));
