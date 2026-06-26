// 联网搜索（智谱 Web Search API）+ 内存缓存（命中复用，降本提速）。
// 在 https://open.bigmodel.cn 申请 key 后写入 .env 的 ZHIPU_API_KEY。

const ZHIPU_KEY = process.env.ZHIPU_API_KEY || "";
const ZHIPU_SEARCH_URL = "https://open.bigmodel.cn/api/paas/v4/web_search";

export interface WebSearchSource {
  title: string;
  url: string;
  snippet: string;
  icon?: string;
  media?: string;
}

// ── 内存缓存（同一服务进程内 LRU + TTL）────────────────────────
interface CacheEntry {
  results: WebSearchSource[];
  ts: number;
}
const CACHE = new Map<string, CacheEntry>();
const TTL_MS = 10 * 60 * 1000;
const MAX_ENTRIES = 100;

function cacheGet(key: string): WebSearchSource[] | null {
  const e = CACHE.get(key);
  if (!e) return null;
  if (Date.now() - e.ts > TTL_MS) {
    CACHE.delete(key);
    return null;
  }
  CACHE.delete(key);
  CACHE.set(key, e);
  return e.results;
}

function cacheSet(key: string, results: WebSearchSource[]) {
  CACHE.set(key, { results, ts: Date.now() });
  if (CACHE.size > MAX_ENTRIES) {
    const oldest = CACHE.keys().next().value;
    if (oldest !== undefined) CACHE.delete(oldest);
  }
}

interface ZhipuSearchOptions {
  searchEngine?: string;
  domainFilter?: string;
  contentSize?: string;
}

async function fetchRaw(
  query: string,
  count: number,
  opts: ZhipuSearchOptions = {},
): Promise<WebSearchSource[]> {
  const body: Record<string, unknown> = {
    search_engine: opts.searchEngine ?? "search_pro",
    search_query: query,
    count: Math.min(Math.max(count, 1), 50),
    search_recency_filter: "noLimit",
    content_size: opts.contentSize ?? "high",
  };
  if (opts.domainFilter) body.search_domain_filter = opts.domainFilter;

  const res = await fetch(ZHIPU_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ZHIPU_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Zhipu Search ${res.status}`);
  const data = await res.json();
  const items = data?.search_result ?? [];
  return items.map((p: Record<string, string>) => ({
    title: p.title ?? "",
    url: p.link ?? "",
    snippet: p.content ?? "",
    icon: p.icon ?? "",
    media: p.media ?? "",
  }));
}

export async function searchCached(
  query: string,
  count = 5,
  opts: ZhipuSearchOptions = {},
): Promise<{ results: WebSearchSource[]; cacheHit: boolean }> {
  const q = query.trim();
  if (!q || !ZHIPU_KEY) return { results: [], cacheHit: false };
  const key = `${q.toLowerCase()}|${count}|${opts.domainFilter ?? ""}`;
  const cached = cacheGet(key);
  if (cached) return { results: cached, cacheHit: true };
  const results = await fetchRaw(q, count, opts);
  cacheSet(key, results);
  return { results, cacheHit: false };
}

export interface WebSearchDetailed {
  content: string;
  sources: WebSearchSource[];
  cacheHit: boolean;
}

export async function runWebSearchDetailed(query: string, numResults = 5): Promise<WebSearchDetailed> {
  const q = query.trim();
  if (!q) return { content: "搜索关键词为空。", sources: [], cacheHit: false };
  if (!ZHIPU_KEY) {
    return {
      content: "联网搜索未配置（请在 .env 设置 ZHIPU_API_KEY）。本次请基于已有知识回答，并明确说明未能联网。",
      sources: [],
      cacheHit: false,
    };
  }
  try {
    const { results, cacheHit } = await searchCached(q, numResults);
    if (!results.length) return { content: `未搜索到「${q}」的相关结果。`, sources: [], cacheHit };
    const content = results
      .slice(0, numResults)
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\n来源：${r.url}`)
      .join("\n\n");
    return { content, sources: results.slice(0, numResults), cacheHit };
  } catch (e) {
    return { content: `联网搜索出错：${String((e as Error)?.message ?? e)}`, sources: [], cacheHit: false };
  }
}
