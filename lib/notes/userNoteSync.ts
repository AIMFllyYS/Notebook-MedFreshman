/**
 * SYNC POINT — 个人笔记与课堂便签共用 persist key `user-notes`（IndexedDB）。
 *
 * 数据模型：`UserNote.kind === "classroom"` 的条目带 `quote` / `source`，
 * 与个人长笔记一起落在 `useUserNotes.byId`。create / update / remove 都走这里，
 * 接入 `CLOUD_SYNC_KINDS` 的 `user-note` 真云同步。
 */
import { scheduleCloudTombstone, scheduleCloudUpsert } from "@/lib/sync/schedule";

export function notifyUserNoteChanged(id: string, op: "upsert" | "tombstone"): void {
  if (!id) return;
  if (op === "tombstone") {
    scheduleCloudTombstone("user-note", id);
    return;
  }
  scheduleCloudUpsert("user-note", id);
}
