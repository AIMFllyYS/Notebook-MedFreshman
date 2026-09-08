// 客户端安全的笔记复合路径解析。searchNotes 命中的 path 形如
// anatomy/textbook/ch09-4；历史数据也可能是 probability/1.4（缺分类，默认 detail）。

import { getCategory, getContentItem, getSubject } from "@/lib/content-data";
import { isSubjectId } from "@/lib/types/content";

export interface ParsedNotePath {
  subjectId: string;
  categoryId: string;
  itemId: string;
}

export function parseNotePath(path: string): ParsedNotePath | null {
  const parts = path.split("/").filter(Boolean);
  if (parts.length >= 3) {
    return { subjectId: parts[0], categoryId: parts[1], itemId: parts.slice(2).join("/") };
  }
  if (parts.length === 2) {
    return { subjectId: parts[0], categoryId: "detail", itemId: parts[1] };
  }
  return null;
}

export function noteHref(parsed: ParsedNotePath): string {
  return `/${parsed.subjectId}/${parsed.categoryId}/${parsed.itemId}`;
}

export function noteBreadcrumb(parsed: ParsedNotePath, fallbackTitle?: string): string {
  if (!isSubjectId(parsed.subjectId)) return fallbackTitle || parsed.itemId;
  const subject = getSubject(parsed.subjectId);
  const category = getCategory(parsed.subjectId, parsed.categoryId);
  const item = getContentItem(parsed.subjectId, parsed.categoryId, parsed.itemId);
  return [subject?.name, category?.name, item?.title || fallbackTitle || parsed.itemId]
    .filter(Boolean)
    .join(" · ");
}
