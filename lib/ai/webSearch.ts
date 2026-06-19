// 联网搜索（硅基流动平台不内置，用博查 Bocha 自建）+ 内存缓存（命中复用，降本提速）。
// 在 https://open.bochaai.com 申请 key 后写入 .env 的 BOCHA_API_KEY。

const BOCHA_KEY = process.env.BOCHA_API_KEY || "";
const BOCHA_URL = process.env.BOCHA_SEARCH_URL || "https://api.bochaai.com/v1/web-search";

export interface WebSearchSource {
  title: string;
  url: string;
  snippet: string;
}

// ── 内存缓存（同一服务进程内 LRU + TTL）────────────────────────
interface CacheEntry {
  results: WebSearchSource[];
  ts: number;
}
const CACHE = new Map<string, CacheEntry>();
const TTL_MS = 10 * 60 * 1000; // 10 分钟
const MAX_ENTRIES = 100;

function cacheGet(key: string): WebSearchSource[] | null {
  const e = CACHE.get(key);
  if (!e) return null;
  if (Date.now() - e.ts > TTL_MS) {
    CACHE.delete(key);
    return null;
  }
  // 触达后移到末尾，维持 LRU 顺序
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

async function fetchRaw(query: string, count: number): Promise<WebSearchSource[]> {
  const res = await fetch(BOCHA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${BOCHA_KEY}`,
    },
    body: JSON.stringify({
      query,
      count: Math.min(Math.max(count, 1), 10),
      summary: true,
      freshness: "noLimit",
    }),
  });
  if (!res.ok) throw new Error(`Bocha ${res.status}`);
  const data = await res.json();
  const pages = data?.data?.webPages?.value ?? [];
  return pages.map((p: Record<string, string>) => ({
    title: p.name ?? "",
    url: p.url ?? "",
    snippet: p.summary || p.snippet || "",
  }));
}

/** 带缓存的搜索：返回来源 + 是否命中缓存。无 key 时返回空。 */
export async function searchCached(
  query: string,
  count = 5,
): Promise<{ results: WebSearchSource[]; cacheHit: boolean }> {
  const q = query.trim();
  if (!q || !BOCHA_KEY) return { results: [], cacheHit: false };
  const key = `${q.toLowerCase()}|${count}`;
  const cached = cacheGet(key);
  if (cached) return { results: cached, cacheHit: true };
  const results = await fetchRaw(q, count);
  cacheSet(key, results);
  return { results, cacheHit: false };
}

export interface WebSearchDetailed {
  content: string; // 给模型的文本
  sources: WebSearchSource[]; // 给前端展示
  cacheHit: boolean;
}

export async function runWebSearchDetailed(query: string, numResults = 5): Promise<WebSearchDetailed> {
  const q = query.trim();
  if (!q) return { content: "搜索关键词为空。", sources: [], cacheHit: false };
  if (!BOCHA_KEY) {
    return {
      content: "联网搜索未配置（请在 .env 设置 BOCHA_API_KEY）。本次请基于已有知识回答，并明确说明未能联网。",
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
