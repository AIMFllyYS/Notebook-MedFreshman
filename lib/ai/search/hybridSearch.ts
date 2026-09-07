// 混合检索 + Rerank：并行 BM25 + 向量 → RRF 合并 → rerank API 精排 → MultiSearchHit[]
import { bm25Search, isBM25IndexLoaded } from "./bm25Store";
import { vectorSearch, isVectorIndexLoaded, getVectorIndexModel } from "./vectorStore";
import type { ScoredChunk } from "./vectorStoreTypes";
import { getQueryEmbeddingClient } from "@/lib/ai/embedding";
import type { MultiSearchHit } from "@/lib/content/loader";
import { normalizeSearchQuery } from "./queryNormalize";
import type { SearchFilter } from "./searchScope";

export type { SearchFilter } from "./searchScope";

type SearchMode = "hybrid" | "vector" | "keyword";

const PREFER_SUBJECT_BOOST = 1.12;
const SNIPPET_CHARS = 400;

function getSearchMode(): SearchMode {
  const mode = process.env.AI_SEARCH_MODE?.toLowerCase();
  if (mode === "vector" || mode === "keyword") return mode;
  return "hybrid";
}

export interface HybridSearchOptions extends SearchFilter {
  topK?: number;
}

function resolveOptions(
  topKOrOpts?: number | HybridSearchOptions,
): { topK: number; filter: SearchFilter } {
  if (typeof topKOrOpts === "number" || topKOrOpts === undefined) {
    return { topK: topKOrOpts ?? 5, filter: {} };
  }
  return {
    topK: topKOrOpts.topK ?? 5,
    filter: {
      academicYear: topKOrOpts.academicYear,
      subjectId: topKOrOpts.subjectId,
      preferSubjectId: topKOrOpts.preferSubjectId,
    },
  };
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

function applyPreferSubject(chunks: ScoredChunk[], preferSubjectId?: string): ScoredChunk[] {
  if (!preferSubjectId) return chunks;
  return chunks
    .map((chunk) =>
      chunk.subjectId === preferSubjectId
        ? { ...chunk, score: chunk.score * PREFER_SUBJECT_BOOST }
        : chunk,
    )
    .sort((a, b) => b.score - a.score);
}

// Rerank API 调用
async function rerank(
  query: string,
  documents: string[],
  topN: number,
): Promise<Array<{ index: number; relevance_score: number }>> {
  const baseUrl = process.env.AI_BASE_URL || "https://api.siliconflow.cn/v1";
  const apiKey = process.env.AI_API_KEY || "";
  const model = process.env.AI_RERANK_MODEL || "BAAI/bge-reranker-v2-m3";

  try {
    const resp = await fetch(`${baseUrl}/rerank`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
  } catch (err) {
    const zhipuBaseUrl = process.env.ZHIPU_BASE_URL || "https://open.bigmodel.cn/api/paas/v4";
    const zhipuKey = process.env.ZHIPU_API_KEY || "";
    const zhipuModel = process.env.ZHIPU_RERANK_MODEL || "rerank";
    if (zhipuBaseUrl && zhipuKey) {
      const resp = await fetch(`${zhipuBaseUrl}/rerank`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${zhipuKey}`,
        },
        body: JSON.stringify({
          model: zhipuModel,
          query,
          documents,
          top_n: topN,
          return_documents: false,
        }),
      });

      if (!resp.ok) {
        throw new Error(`Zhipu Rerank API error ${resp.status}`);
      }

      const json = await resp.json();
      return json.results ?? [];
    }
    throw err;
  }
}

export async function hybridSearch(
  query: string,
  topKOrOpts: number | HybridSearchOptions = 5,
): Promise<MultiSearchHit[]> {
  const { topK, filter } = resolveOptions(topKOrOpts);
  const mode = getSearchMode();
  const hasVectorIndex = await isVectorIndexLoaded();
  const hasBM25Index = await isBM25IndexLoaded();

  if (!hasVectorIndex && !hasBM25Index) {
    return [];
  }

  const retrievalQuery = normalizeSearchQuery(query);
  const rankings: ScoredChunk[][] = [];

  if (mode !== "vector" && hasBM25Index) {
    const bm25Results = await bm25Search(retrievalQuery, 40, filter);
    if (bm25Results.length) rankings.push(bm25Results);
  }

  if (mode !== "keyword" && hasVectorIndex) {
    try {
      const indexModel = await getVectorIndexModel();
      const embeddingClient = getQueryEmbeddingClient(indexModel);
      const queryVector = await embeddingClient.embed(retrievalQuery);
      const vecResults = await vectorSearch(queryVector, 40, filter);
      if (vecResults.length) rankings.push(vecResults);
    } catch {
      // embedding API 失败时仅用 BM25
    }
  }

  if (!rankings.length) return [];

  let merged = applyPreferSubject(rrfMerge(rankings), filter.preferSubjectId);
  const candidates = merged.slice(0, 40);

  if (!candidates.length) return [];

  let finalChunks: ScoredChunk[];
  if (mode !== "keyword") {
    try {
      const rerankResults = await rerank(
        retrievalQuery,
        candidates.map((c) => c.text),
        Math.max(topK, 8),
      );
      finalChunks = rerankResults.map((r) => ({
        ...candidates[r.index],
        score: r.relevance_score,
      }));
    } catch {
      finalChunks = candidates.slice(0, topK);
    }
  } else {
    finalChunks = candidates.slice(0, topK);
  }

  const seenPaths = new Set<string>();
  const deduped: ScoredChunk[] = [];
  for (const chunk of finalChunks) {
    if (!seenPaths.has(chunk.path)) {
      seenPaths.add(chunk.path);
      deduped.push(chunk);
    }
    if (deduped.length >= topK) break;
  }

  return deduped.map((chunk) => ({
    subjectId: chunk.subjectId,
    subjectName: chunk.subjectName,
    categoryId: chunk.categoryId,
    itemId: chunk.itemId,
    title: chunk.title,
    snippet: chunk.text.slice(0, SNIPPET_CHARS),
    path: chunk.path,
  }));
}
