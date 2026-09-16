import type { GlobalSearchHit } from "@/lib/search/globalSearch";

/** 拉一个科目的正文分片。失败当空，让其它分片继续出结果。 */
export async function fetchSubjectBodyHits(
  subjectId: string,
  query: string,
  signal?: AbortSignal,
): Promise<GlobalSearchHit[]> {
  const params = new URLSearchParams({ q: query, subjectId });
  const res = await fetch(`/api/global-search?${params}`, { signal });
  if (!res.ok) return [];
  const data = (await res.json()) as { hits?: GlobalSearchHit[] };
  return Array.isArray(data.hits) ? data.hits : [];
}
