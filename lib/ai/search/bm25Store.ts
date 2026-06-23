// BM25 检索：惰性加载 bm25.json，提供 BM25 评分 top-K 查询。
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ScoredChunk } from './vectorStore';

interface BM25Index {
  builtAt: string;
  avgDocLen: number;
  docCount: number;
  invertedIndex: Record<string, { df: number; postings: Array<{ id: string; tf: number }> }>;
  docLengths: Record<string, number>;
}

// chunk 元数据缓存（从 vectors.json 加载以获取文本和路径信息）
interface ChunkMeta {
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

let _bm25Index: BM25Index | null = null;
let _chunkMeta: Map<string, ChunkMeta> | null = null;
let _loadAttempted = false;

function loadIndex(): BM25Index | null {
  if (_loadAttempted) return _bm25Index;
  _loadAttempted = true;

  const bm25Path = path.join(process.cwd(), 'content', '.index', 'bm25.json');
  try {
    const raw = fs.readFileSync(bm25Path, 'utf8');
    _bm25Index = JSON.parse(raw);
  } catch {
    return null;
  }

  // 加载 chunk 元数据（从 vectors.json 中获取文本信息）
  const vectorPath = path.join(process.cwd(), 'content', '.index', 'vectors.json');
  try {
    const raw = fs.readFileSync(vectorPath, 'utf8');
    const vectorIndex = JSON.parse(raw);
    _chunkMeta = new Map();
    for (const chunk of vectorIndex.chunks) {
      _chunkMeta.set(chunk.id, {
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
  } catch {
    // vector 文件不存在时 BM25 仍可用，但结果会缺少 text 字段
  }

  return _bm25Index;
}

// 分词逻辑与构建时一致（bigram + 空格分割）
function tokenize(text: string): string[] {
  const tokens: string[] = [];
  let englishBuf = '';

  for (const char of text) {
    const code = char.codePointAt(0)!;
    if (code > 0x4dff && code < 0x9fff) {
      if (englishBuf.trim()) {
        tokens.push(...englishBuf.trim().toLowerCase().split(/\s+/));
        englishBuf = '';
      }
      tokens.push(char);
    } else if (/[a-zA-Z0-9]/.test(char)) {
      englishBuf += char;
    } else {
      if (englishBuf.trim()) {
        tokens.push(...englishBuf.trim().toLowerCase().split(/\s+/));
        englishBuf = '';
      }
    }
  }
  if (englishBuf.trim()) {
    tokens.push(...englishBuf.trim().toLowerCase().split(/\s+/));
  }

  const result: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    result.push(tokens[i]);
    if (
      i < tokens.length - 1 &&
      tokens[i].length === 1 &&
      tokens[i + 1].length === 1 &&
      tokens[i].codePointAt(0)! > 0x4dff &&
      tokens[i + 1].codePointAt(0)! > 0x4dff
    ) {
      result.push(tokens[i] + tokens[i + 1]);
    }
  }

  return result;
}

const K1 = 1.5;
const B = 0.75;

export function bm25Search(query: string, topK: number): ScoredChunk[] {
  const index = loadIndex();
  if (!index) return [];

  const queryTerms = tokenize(query);
  if (!queryTerms.length) return [];

  const scores: Record<string, number> = {};
  const { avgDocLen, docCount, invertedIndex, docLengths } = index;

  for (const term of queryTerms) {
    const entry = invertedIndex[term];
    if (!entry) continue;

    const idf = Math.log((docCount - entry.df + 0.5) / (entry.df + 0.5) + 1);

    for (const posting of entry.postings) {
      const docLen = docLengths[posting.id] || 1;
      const tf = posting.tf;
      const tfNorm = (tf * (K1 + 1)) / (tf + K1 * (1 - B + B * (docLen / avgDocLen)));
      scores[posting.id] = (scores[posting.id] || 0) + idf * tfNorm;
    }
  }

  const sortedIds = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK);

  return sortedIds.map(([id, score]) => {
    const meta = _chunkMeta?.get(id);
    return {
      id,
      path: meta?.path ?? id.split('#')[0],
      subjectId: meta?.subjectId ?? '',
      subjectName: meta?.subjectName ?? '',
      categoryId: meta?.categoryId ?? '',
      itemId: meta?.itemId ?? '',
      title: meta?.title ?? '',
      chunkIndex: meta?.chunkIndex ?? 0,
      text: meta?.text ?? '',
      score,
    };
  });
}

export function isBM25IndexLoaded(): boolean {
  return loadIndex() !== null;
}
