// 向量存储：惰性加载 vectors.json，提供余弦相似度 top-K 查询。
import * as fs from 'node:fs';
import * as path from 'node:path';

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

function loadIndex(): VectorIndex | null {
  if (_loadAttempted) return _vectorIndex;
  _loadAttempted = true;

  const indexPath = path.join(process.cwd(), 'content', '.index', 'vectors.json');
  try {
    const raw = fs.readFileSync(indexPath, 'utf8');
    _vectorIndex = JSON.parse(raw);
    return _vectorIndex;
  } catch {
    return null;
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
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

export function vectorSearch(queryEmbedding: number[], topK: number): ScoredChunk[] {
  const index = loadIndex();
  if (!index || !index.chunks.length) return [];

  const scored: ScoredChunk[] = index.chunks.map((chunk) => ({
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
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

export function isVectorIndexLoaded(): boolean {
  return loadIndex() !== null;
}
