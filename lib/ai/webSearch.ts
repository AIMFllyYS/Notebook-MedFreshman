// 联网搜索（硅基流动平台不内置，用博查 Bocha 自建）。
// S2：可用的基础实现（返回文本结果给模型）。S5 增加缓存与前端来源卡片组件。
// 在 https://open.bochaai.com 申请 key 后写入 .env 的 BOCHA_API_KEY。

const BOCHA_KEY = process.env.BOCHA_API_KEY || "";
const BOCHA_URL = process.env.BOCHA_SEARCH_URL || "https://api.bochaai.com/v1/web-search";

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

export async function fetchWebSearch(query: string, count = 5): Promise<WebSearchResult[]> {
  const q = query.trim();
  if (!q || !BOCHA_KEY) return [];
  const res = await fetch(BOCHA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${BOCHA_KEY}`,
    },
    body: JSON.stringify({
      query: q,
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

/** 给模型的文本化搜索结果（tool 返回值）。 */
export async function runWebSearch(query: string, numResults = 5): Promise<string> {
  const q = query.trim();
  if (!q) return "搜索关键词为空。";
  if (!BOCHA_KEY) {
    return "联网搜索未配置（请在 .env 设置 BOCHA_API_KEY）。本次请基于已有知识回答，并明确说明未能联网。";
  }
  try {
    const results = await fetchWebSearch(q, numResults);
    if (!results.length) return `未搜索到「${q}」的相关结果。`;
    return results
      .slice(0, numResults)
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\n来源：${r.url}`)
      .join("\n\n");
  } catch (e) {
    return `联网搜索出错：${String((e as Error)?.message ?? e)}`;
  }
}
