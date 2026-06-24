// BM25 检索：惰性加载 bm25.json，提供 BM25 评分 top-K 查询。
// 加载顺序：本地 content/.index/ → /tmp 缓存 → COS 远程下载。
// 307MB 索引不打包进 serverless 函数（outputFileTracingExcludes 排除），
// EdgeOne 运行时从 COS 下载到 /tmp 缓存，本地开发直接读本地文件。
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
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

const LOCAL_INDEX_DIR = path.join(process.cwd(), 'content', '.index');
const TMP_INDEX_DIR = path.join(os.tmpdir(), '.search-index');

function getCosIndexBaseUrl(): string {
  return process.env.COS_INDEX_BASE_URL || '';
}

function readJsonFromPaths(filePaths: string[]): string | null {
  for (const p of filePaths) {
    try {
      return fs.readFileSync(p, 'utf8');
    } catch {
      continue;
    }
  }
  return null;
}

async function downloadFromCos(filename: string): Promise<string | null> {
  const baseUrl = getCosIndexBaseUrl();
  if (!baseUrl) return null;
  const url = baseUrl.endsWith('/')
    ? baseUrl + filename
    : baseUrl + '/' + filename;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`COS fetch ${resp.status}: ${url}`);
  const text = await resp.text();
  try {
    fs.mkdirSync(TMP_INDEX_DIR, { recursive: true });
    fs.writeFileSync(path.join(TMP_INDEX_DIR, filename), text);
  } catch {
    // /tmp 写入失败不影响内存使用
  }
  return text;
}

async function loadIndexAsync(): Promise<BM25Index | null> {
  if (_loadAttempted) return _bm25Index;
  _loadAttempted = true;

  // 1. 尝试本地 + /tmp 缓存
  let bm25Raw = readJsonFromPaths([
    path.join(LOCAL_INDEX_DIR, 'bm25.json'),
    path.join(TMP_INDEX_DIR, 'bm25.json'),
  ]);

  // 2. 本地没有 → 从 COS 下载
  if (!bm25Raw) {
    try {
      bm25Raw = await downloadFromCos('bm25.json');
    } catch {
      return null;
    }
  }
  if (!bm25Raw) return null;

  try {
    _bm25Index = JSON.parse(bm25Raw);
  } catch {
    return null;
  }

  // 3. 加载 chunk 元数据（从 vectors.json）
  let vecRaw = readJsonFromPaths([
    path.join(LOCAL_INDEX_DIR, 'vectors.json'),
    path.join(TMP_INDEX_DIR, 'vectors.json'),
  ]);
  if (!vecRaw) {
    try {
      vecRaw = await downloadFromCos('vectors.json');
    } catch {
      // vector 文件不存在时 BM25 仍可用，但结果会缺少 text 字段
    }
  }
  if (vecRaw) {
    try {
      const vectorIndex = JSON.parse(vecRaw);
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
      // vectors.json 解析失败，BM25 仍可用
    }
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

export async function bm25Search(query: string, topK: number): Promise<ScoredChunk[]> {
  const index = await loadIndexAsync();
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

export async function isBM25IndexLoaded(): Promise<boolean> {
  return (await loadIndexAsync()) !== null;
}
