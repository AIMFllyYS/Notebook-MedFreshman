// 向量存储：惰性加载 vectors.json，提供余弦相似度 top-K 查询。
// 加载顺序：本地 content/.index/ → /tmp 缓存 → COS 远程下载。
// 307MB 索引不打包进 serverless 函数（outputFileTracingExcludes 排除），
// EdgeOne 运行时从 COS 下载到 /tmp 缓存，本地开发直接读本地文件。
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

export interface ScoredChunk {
  id: string;
  path: string;
  subjectId: string;
  subjectName: string;
  categoryId: string;
  itemId: string;
  title: string;
  chunkIndex: number;
  text: string;
  score: number;
}

interface VectorEntry {
  id: string;
  path: string;
  subjectId: string;
  subjectName: string;
  categoryId: string;
  itemId: string;
  title: string;
  chunkIndex: number;
  text: string;
  vector: number[];
}

interface VectorIndex {
  model: string;
  dimension: number;
  builtAt: string;
  chunks: VectorEntry[];
}

let _vectorIndex: VectorIndex | null = null;
let _loadAttempted = false;

const LOCAL_INDEX_DIR = path.join(process.cwd(), 'content', '.index');
const TMP_INDEX_DIR = path.join(os.tmpdir(), '.search-index');

function getCosIndexBaseUrl(): string {
  return process.env.COS_INDEX_BASE_URL || '';
}

function loadFromLocal(): string | null {
  const indexPath = path.join(LOCAL_INDEX_DIR, 'vectors.json');
  try {
    return fs.readFileSync(indexPath, 'utf8');
  } catch {
    return null;
  }
}

function loadFromTmpCache(): string | null {
  const cachePath = path.join(TMP_INDEX_DIR, 'vectors.json');
  try {
    return fs.readFileSync(cachePath, 'utf8');
  } catch {
    return null;
  }
}

async function downloadFromCos(): Promise<string | null> {
  const baseUrl = getCosIndexBaseUrl();
  if (!baseUrl) return null;
  const url = baseUrl.endsWith('/')
    ? baseUrl + 'vectors.json'
    : baseUrl + '/vectors.json';
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`COS fetch ${resp.status}: ${url}`);
  const text = await resp.text();
  try {
    fs.mkdirSync(TMP_INDEX_DIR, { recursive: true });
    fs.writeFileSync(path.join(TMP_INDEX_DIR, 'vectors.json'), text);
  } catch {
    // /tmp 写入失败不影响内存使用
  }
  return text;
}

async function loadIndexAsync(): Promise<VectorIndex | null> {
  if (_loadAttempted) return _vectorIndex;
  _loadAttempted = true;

  let raw = loadFromLocal();
  if (!raw) raw = loadFromTmpCache();
  if (!raw) {
    try {
      raw = await downloadFromCos();
    } catch {
      return null;
    }
  }
  if (!raw) return null;

  try {
    _vectorIndex = JSON.parse(raw);
    return _vectorIndex;
  } catch {
    return null;
  }
}

function loadIndex(): VectorIndex | null {
  if (_loadAttempted) return _vectorIndex;
  _loadAttempted = true;

  let raw = loadFromLocal();
  if (!raw) raw = loadFromTmpCache();
  if (!raw) return null;

  try {
    _vectorIndex = JSON.parse(raw);
    return _vectorIndex;
  } catch {
    return null;
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
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

export async function vectorSearch(queryEmbedding: number[], topK: number): Promise<ScoredChunk[]> {
  const index = await loadIndexAsync();
  if (!index || !index.chunks.length) return [];

  const heap = new TopKMinHeap(topK);
  for (const chunk of index.chunks) {
    heap.push({
      id: chunk.id,
      path: chunk.path,
      subjectId: chunk.subjectId,
      subjectName: chunk.subjectName,
      categoryId: chunk.categoryId,
      itemId: chunk.itemId,
      title: chunk.title,
      chunkIndex: chunk.chunkIndex,
      text: chunk.text,
      score: cosineSimilarity(queryEmbedding, chunk.vector),
    });
  }
  return heap.toSortedDesc();
}

export async function isVectorIndexLoaded(): Promise<boolean> {
  return (await loadIndexAsync()) !== null;
}
