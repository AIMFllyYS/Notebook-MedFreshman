// 混合检索 + Rerank：并行 BM25 + 向量 → RRF 合并 → rerank API 精排 → MultiSearchHit[]
import { bm25Search, isBM25IndexLoaded } from './bm25Store';
import { vectorSearch, isVectorIndexLoaded } from './vectorStore';
import type { ScoredChunk } from './vectorStore';
import { getEmbeddingClient } from '@/lib/ai/embedding';
import type { MultiSearchHit } from '@/lib/content/loader';

type SearchMode = 'hybrid' | 'vector' | 'keyword';

function getSearchMode(): SearchMode {
  const mode = process.env.AI_SEARCH_MODE?.toLowerCase();
  if (mode === 'vector' || mode === 'keyword') return mode;
  return 'hybrid';
}

// RRF (Reciprocal Rank Fusion) 合并
export function rrfMerge(rankings: ScoredChunk[][], k = 60): ScoredChunk[] {
  const scoreMap = new Map<string, { score: number; chunk: ScoredChunk }>();

  for (const ranking of rankings) {
    for (let rank = 0; rank < ranking.length; rank++) {
      const chunk = ranking[rank];
      const rrfScore = 1 / (k + rank + 1);
      const existing = scoreMap.get(chunk.id);
      if (existing) {
        existing.score += rrfScore;
      } else {
        scoreMap.set(chunk.id, { score: rrfScore, chunk });
      }
    }
  }

  return Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score)
    .map((entry) => ({ ...entry.chunk, score: entry.score }));
}

// Rerank API 调用
async function rerank(
  query: string,
  documents: string[],
  topN: number,
): Promise<Array<{ index: number; relevance_score: number }>> {
  const baseUrl = process.env.AI_BASE_URL || 'https://api.siliconflow.cn/v1';
  const apiKey = process.env.AI_API_KEY || '';
  const model = process.env.AI_RERANK_MODEL || 'BAAI/bge-reranker-v2-m3';

  const resp = await fetch(`${baseUrl}/rerank`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      query,
      documents,
      top_n: topN,
      return_documents: false,
    }),
  });

  if (!resp.ok) {
    throw new Error(`Rerank API error ${resp.status}`);
  }

  const json = await resp.json();
  return json.results ?? [];
}

export async function hybridSearch(
  query: string,
  topK = 5,
): Promise<MultiSearchHit[]> {
  const mode = getSearchMode();
  const hasVectorIndex = await isVectorIndexLoaded();
  const hasBM25Index = await isBM25IndexLoaded();

  if (!hasVectorIndex && !hasBM25Index) {
    return [];
  }

  const rankings: ScoredChunk[][] = [];

  // BM25 检索
  if (mode !== 'vector' && hasBM25Index) {
    const bm25Results = await bm25Search(query, 30);
    if (bm25Results.length) rankings.push(bm25Results);
  }

  // 向量检索
  if (mode !== 'keyword' && hasVectorIndex) {
    try {
      const embeddingClient = getEmbeddingClient();
      const queryVector = await embeddingClient.embed(query);
      const vecResults = await vectorSearch(queryVector, 30);
      if (vecResults.length) rankings.push(vecResults);
    } catch {
      // embedding API 失败时仅用 BM25
    }
  }

  if (!rankings.length) return [];

  // RRF 合并
  const merged = rrfMerge(rankings);
  const candidates = merged.slice(0, 30);

  if (!candidates.length) return [];

  // Rerank 精排
  let finalChunks: ScoredChunk[];
  if (mode !== 'keyword') {
    try {
      const rerankResults = await rerank(
        query,
        candidates.map((c) => c.text),
        topK,
      );
      finalChunks = rerankResults.map((r) => ({
        ...candidates[r.index],
        score: r.relevance_score,
      }));
    } catch {
      // rerank 失败时直接用 RRF 结果
      finalChunks = candidates.slice(0, topK);
    }
  } else {
    finalChunks = candidates.slice(0, topK);
  }

  // 去重：同一 path 只保留最高分的 chunk
  const seenPaths = new Set<string>();
  const deduped: ScoredChunk[] = [];
  for (const chunk of finalChunks) {
    if (!seenPaths.has(chunk.path)) {
      seenPaths.add(chunk.path);
      deduped.push(chunk);
    }
  }

  return deduped.map((chunk) => ({
    subjectId: chunk.subjectId,
    subjectName: chunk.subjectName,
    categoryId: chunk.categoryId,
    itemId: chunk.itemId,
    title: chunk.title,
    snippet: chunk.text.slice(0, 200),
    path: chunk.path,
  }));
}
