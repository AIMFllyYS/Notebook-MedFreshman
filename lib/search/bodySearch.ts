// 服务端：按科目分片扫 Markdown / 纯文本正文。不要在客户端 import（会拖进 fs）。
import { contentTree } from "@/lib/content-data/manifest";
import { readContentMarkdown } from "@/lib/content/loader";
import { isSubjectId } from "@/lib/types/content";
import {
  buildGlobalSearchIndex,
  clampSearchQuery,
  matchBodyText,
  type GlobalSearchHit,
} from "@/lib/search/globalSearch";

const SUBJECT_BODY_LIMIT = 16;

export function searchSubjectBody(
  subjectId: string,
  rawQuery: string,
  limit = SUBJECT_BODY_LIMIT,
): GlobalSearchHit[] {
  const query = clampSearchQuery(rawQuery);
  if (!query || !isSubjectId(subjectId)) return [];

  const entries = buildGlobalSearchIndex(contentTree).filter((entry) => entry.subjectId === subjectId);
  const hits: GlobalSearchHit[] = [];
  for (const entry of entries) {
    const raw = readContentMarkdown(entry.subjectId, entry.categoryId, entry.itemId);
    if (!raw) continue;
    const hit = matchBodyText(entry, raw, query);
    if (hit) hits.push(hit);
  }

  return hits
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "zh-CN"))
    .slice(0, limit);
}
