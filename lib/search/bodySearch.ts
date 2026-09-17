// 服务端：按科目分片扫 Markdown / 纯文本正文。不要在客户端 import（会拖进 fs）。
import { contentTree } from "@/lib/content-data/manifest";
import { readContentMarkdown } from "@/lib/content/loader";
import { isSubjectId } from "@/lib/types/content";
import {
  buildGlobalSearchIndex,
  clampSearchQuery,
  matchBodyText,
  stripForSearch,
  type GlobalSearchEntry,
  type GlobalSearchHit,
} from "@/lib/search/globalSearch";

const SUBJECT_BODY_LIMIT = 16;

let entriesBySubject: Map<string, GlobalSearchEntry[]> | null = null;
const strippedByEntryId = new Map<string, string>();

function subjectEntries(subjectId: string): GlobalSearchEntry[] {
  if (!entriesBySubject) {
    entriesBySubject = new Map();
    for (const entry of buildGlobalSearchIndex(contentTree)) {
      const list = entriesBySubject.get(entry.subjectId) ?? [];
      list.push(entry);
      entriesBySubject.set(entry.subjectId, list);
    }
  }
  return entriesBySubject.get(subjectId) ?? [];
}

function preparedBodyFor(entry: GlobalSearchEntry): string | null {
  const cached = strippedByEntryId.get(entry.id);
  if (cached !== undefined) return cached || null;
  const raw = readContentMarkdown(entry.subjectId, entry.categoryId, entry.itemId);
  const stripped = raw ? stripForSearch(raw) : "";
  strippedByEntryId.set(entry.id, stripped);
  return stripped || null;
}

/** 测试用：确认暖查询不再扩缓存。 */
export function bodySearchCacheSize(): number {
  return strippedByEntryId.size;
}

export function __resetBodySearchCacheForTests(): void {
  entriesBySubject = null;
  strippedByEntryId.clear();
}

export function searchSubjectBody(
  subjectId: string,
  rawQuery: string,
  limit = SUBJECT_BODY_LIMIT,
): GlobalSearchHit[] {
  const query = clampSearchQuery(rawQuery);
  if (!query || !isSubjectId(subjectId)) return [];

  const hits: GlobalSearchHit[] = [];
  for (const entry of subjectEntries(subjectId)) {
    const body = preparedBodyFor(entry);
    if (!body) continue;
    const hit = matchBodyText(entry, body, query, body);
    if (hit) hits.push(hit);
  }

  return hits
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "zh-CN"))
    .slice(0, limit);
}
