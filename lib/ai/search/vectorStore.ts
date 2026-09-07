// 向量存储：只加载本地 content/.index/vectors.bin（与 chunks-meta 按 id 对齐）。
import type { ScoredChunk } from "./vectorStoreTypes";
import type { SearchFilter } from "./searchScope";
import { chunkInScope } from "./searchScope";
import {
  INDEX_FILES,
  parseManifest,
  readLocalIndexFile,
} from "./indexIo";
import { searchLogOnce } from "./searchLog";

export type { ScoredChunk } from "./vectorStoreTypes";

interface ChunkRow {
  id: string;
  path: string;
  subjectId: string;
  subjectName: string;
  categoryId: string;
  itemId: string;
  title: string;
  chunkIndex: number;
  text: string;
}

interface VectorIndex {
  model: string;
  dimension: number;
  ids: string[];
  metaById: Map<string, ChunkRow>;
  matrix: Float32Array;
}

let _vectorIndex: VectorIndex | null = null;
let _loadAttempted = false;

export function cosineSimilarity(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const x = a[i];
    const y = b[i];
    dot += x * y;
    normA += x * x;
    normB += y * y;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export function cosineSimilarityRow(
  query: ArrayLike<number>,
  matrix: Float32Array,
  rowOffset: number,
  dim: number,
): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < dim; i++) {
    const x = query[i] ?? 0;
    const y = matrix[rowOffset + i];
    dot += x * y;
    normA += x * x;
    normB += y * y;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/** size-K 最小堆：单遍扫描保留 top-K，避免全量 sort。 */
class TopKMinHeap {
  private readonly maxSize: number;
  private heap: ScoredChunk[] = [];

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  push(item: ScoredChunk): void {
    if (this.heap.length < this.maxSize) {
      this.heap.push(item);
      this.bubbleUp(this.heap.length - 1);
      return;
    }
    if (item.score <= this.heap[0].score) return;
    this.heap[0] = item;
    this.bubbleDown(0);
  }

  toSortedDesc(): ScoredChunk[] {
    return [...this.heap].sort((a, b) => b.score - a.score);
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].score <= this.heap[i].score) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  private bubbleDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left].score < this.heap[smallest].score) smallest = left;
      if (right < n && this.heap[right].score < this.heap[smallest].score) smallest = right;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

function parseChunkRows(raw: Buffer | null): ChunkRow[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw.toString("utf8"));
    const chunks = Array.isArray(parsed?.chunks) ? parsed.chunks : Array.isArray(parsed) ? parsed : [];
    return chunks.filter((c: ChunkRow) => c?.id);
  } catch {
    return [];
  }
}

function metaMapFromRows(rows: ChunkRow[]): Map<string, ChunkRow> {
  const map = new Map<string, ChunkRow>();
  for (const row of rows) map.set(row.id, row);
  return map;
}

function float32FromBuffer(buf: Buffer): Float32Array {
  const copy = new Uint8Array(buf.byteLength);
  copy.set(buf);
  return new Float32Array(copy.buffer);
}

function loadBinaryIndex(bin: Buffer, idsRaw: Buffer, metaById: Map<string, ChunkRow>): VectorIndex | null {
  let ids: string[];
  try {
    ids = JSON.parse(idsRaw.toString("utf8"));
  } catch {
    return null;
  }
  if (!Array.isArray(ids) || ids.length === 0) return null;
  const matrix = float32FromBuffer(bin);
  const dimension = Math.floor(matrix.length / ids.length);
  if (dimension < 8 || dimension * ids.length !== matrix.length) {
    searchLogOnce("error", "search.index.missing", `vectors.bin 长度与 ids 不对齐（ids=${ids.length}, floats=${matrix.length}），跳过向量索引`);
    return null;
  }
  const manifest = parseManifest(readLocalIndexFile(INDEX_FILES.manifest));
  return {
    model: manifest?.embeddingModel || process.env.AI_EMBEDDING_MODEL || "BAAI/bge-m3",
    dimension,
    ids,
    metaById,
    matrix,
  };
}

function loadLegacyJsonIndex(raw: Buffer, localMeta: Map<string, ChunkRow>): VectorIndex | null {
  try {
    const parsed = JSON.parse(raw.toString("utf8")) as {
      model?: string;
      dimension?: number;
      chunks?: Array<ChunkRow & { vector?: number[] }>;
    };
    const chunks = parsed.chunks ?? [];
    if (!chunks.length || !chunks[0]?.vector?.length) return null;

    if (localMeta.size > 0) {
      const overlap = chunks.filter((c) => localMeta.has(c.id)).length;
      if (overlap < chunks.length * 0.8) {
        searchLogOnce(
          "warn",
          "search.index.loaded",
          `跳过 vectors.json：与本地 chunks-meta 重叠过低（${overlap}/${chunks.length}），避免混入过期向量`,
        );
        return null;
      }
    }

    const dimension = parsed.dimension || chunks[0].vector.length;
    const ids: string[] = [];
    const matrix = new Float32Array(chunks.length * dimension);
    const metaById = new Map<string, ChunkRow>(localMeta);
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (!chunk.vector || chunk.vector.length !== dimension) continue;
      ids.push(chunk.id);
      matrix.set(chunk.vector, ids.length * dimension - dimension);
      if (!metaById.has(chunk.id)) {
        metaById.set(chunk.id, {
          id: chunk.id,
          path: chunk.path,
          subjectId: chunk.subjectId,
          subjectName: chunk.subjectName,
          categoryId: chunk.categoryId,
          itemId: chunk.itemId,
          title: chunk.title,
          chunkIndex: chunk.chunkIndex,
          text: chunk.text,
        });
      }
    }
    if (!ids.length) return null;
    return {
      model: parsed.model || process.env.AI_EMBEDDING_MODEL || "BAAI/bge-m3",
      dimension,
      ids,
      metaById,
      matrix: ids.length === chunks.length ? matrix : matrix.subarray(0, ids.length * dimension),
    };
  } catch {
    return null;
  }
}

async function loadIndexAsync(): Promise<VectorIndex | null> {
  if (_loadAttempted) return _vectorIndex;
  _loadAttempted = true;

  const metaRows = parseChunkRows(readLocalIndexFile(INDEX_FILES.chunksMeta));
  const metaById = metaMapFromRows(metaRows);

  const localBin = readLocalIndexFile(INDEX_FILES.vectorsBin);
  const localIds = readLocalIndexFile(INDEX_FILES.vectorsIds);
  if (localBin && localIds) {
    _vectorIndex = loadBinaryIndex(localBin, localIds, metaById);
    if (_vectorIndex) {
      searchLogOnce(
        "info",
        "search.index.loaded",
        `向量索引 vectors.bin 已加载：${_vectorIndex.ids.length} 条 × ${_vectorIndex.dimension} 维`,
        { file: INDEX_FILES.vectorsBin, count: _vectorIndex.ids.length, dimension: _vectorIndex.dimension },
      );
      return _vectorIndex;
    }
  }

  const legacy = readLocalIndexFile(INDEX_FILES.vectorsJson);
  if (legacy) {
    _vectorIndex = loadLegacyJsonIndex(legacy, metaById);
    if (_vectorIndex) {
      searchLogOnce("info", "search.index.loaded", `向量索引 vectors.json（旧格式）已加载：${_vectorIndex.ids.length} 条`);
      return _vectorIndex;
    }
  }

  searchLogOnce("error", "search.index.missing", "本地无可用向量索引（缺 vectors.bin）。请运行 pnpm build-index。");
  return null;
}

export async function vectorSearch(
  queryEmbedding: number[],
  topK: number,
  filter?: SearchFilter,
): Promise<ScoredChunk[]> {
  const index = await loadIndexAsync();
  if (!index || !index.ids.length) return [];
  if (queryEmbedding.length !== index.dimension) {
    searchLogOnce(
      "error",
      "search.embed.error",
      `查询向量维度 ${queryEmbedding.length} 与索引 ${index.dimension} 不一致，跳过向量检索`,
    );
    return [];
  }

  const heap = new TopKMinHeap(topK);
  const { ids, matrix, dimension, metaById } = index;
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const meta = metaById.get(id);
    if (!meta) continue;
    if (!chunkInScope(meta.subjectId, filter)) continue;
    heap.push({
      id: meta.id,
      path: meta.path,
      subjectId: meta.subjectId,
      subjectName: meta.subjectName,
      categoryId: meta.categoryId,
      itemId: meta.itemId,
      title: meta.title,
      chunkIndex: meta.chunkIndex,
      text: meta.text,
      score: cosineSimilarityRow(queryEmbedding, matrix, i * dimension, dimension),
    });
  }
  return heap.toSortedDesc();
}

export async function isVectorIndexLoaded(): Promise<boolean> {
  return (await loadIndexAsync()) !== null;
}

export async function getVectorIndexModel(): Promise<string | null> {
  const index = await loadIndexAsync();
  return index?.model ?? null;
}

/** 测试用：清空惰性缓存。 */
export function resetVectorIndexCache(): void {
  _vectorIndex = null;
  _loadAttempted = false;
}
