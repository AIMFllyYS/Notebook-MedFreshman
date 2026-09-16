// 用户笔记列表的纯函数：筛选与展示。
// store 的 bySubject / search 和组件里的列表都调这里，避免同一套检索规则被抄两份
// （组件必须能直接吃 byId / order 才会随 store 变化重渲染）。

import type { UserNote } from "@/lib/user-notes/types";

/** 按插入顺序取出全部笔记。 */
export function orderedUserNotes(byId: Record<string, UserNote>, order: string[]): UserNote[] {
  return order.map((id) => byId[id]).filter(Boolean);
}

/** 按科目 / 关键词（标题 + 正文，大小写不敏感）筛选，结果按 updatedAt 倒序。 */
export function filterUserNotes(
  notes: UserNote[],
  { query = "", subjectId }: { query?: string; subjectId?: string } = {},
): UserNote[] {
  const needle = query.trim().toLowerCase();
  return notes
    .filter((n) => (subjectId ? n.subjectId === subjectId : true))
    .filter((n) =>
      needle
        ? n.title.toLowerCase().includes(needle) || n.markdown.toLowerCase().includes(needle)
        : true,
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

/** 相对时间描述，超过一周退回日期。 */
export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "刚刚";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} 天前`;
  return new Date(ts).toLocaleDateString("zh-CN");
}

/** 取正文里第一段有内容的文字当摘要（去掉标题井号）。 */
export function markdownExcerpt(markdown: string): string {
  const line = markdown
    .split("\n")
    .map((l) => l.replace(/^#{1,6}\s*/, "").trim())
    .find((l) => l.length > 0);
  return line ?? "空笔记";
}
