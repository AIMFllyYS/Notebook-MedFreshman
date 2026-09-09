// BM25 检索：惰性加载 content/.index/bm25.json（v3 紧凑格式或旧版字符串 posting）。
import { parseBm25Index, tokenize, type RuntimeBm25Index } from "@/lib/ai/indexing/bm25Index";
import type { ScoredChunk } from "./vectorStoreTypes";
import type { SearchFilter } from "./searchScope";
import { chunkInScope } from "./searchScope";
import { INDEX_FILES, readLocalIndexFile } from "./indexIo";
import { searchLog, searchLogOnce } from "./searchLog";

export { tokenize };

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

let _bm25Index: RuntimeBm25Index | null = null;
let _chunkMeta: Map<string, ChunkMeta> | null = null;
let _loadAttempted = false;
let _builtAt = "";

const MAX_JSON_CHARS = 400 * 1024 * 1024;

function parseChunkMeta(raw: Buffer | null): Map<string, ChunkMeta> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw.toString("utf8"));
    const chunks = Array.isArray(parsed?.chunks) ? parsed.chunks : Array.isArray(parsed) ? parsed : [];
    const map = new Map<string, ChunkMeta>();
    for (const chunk of chunks) {
      if (!chunk?.id) continue;
      map.set(chunk.id, {
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
    return map;
  } catch (err) {
    searchLog.error("search.index.parse_error", { file: INDEX_FILES.chunksMeta, message: String((err as Error).message) });
    return null;
  }
}

async function loadIndexAsync(): Promise<RuntimeBm25Index | null> {
  if (_loadAttempted) return _bm25Index;
  _loadAttempted = true;

  const bm25Buf = readLocalIndexFile(INDEX_FILES.bm25);
  if (!bm25Buf) {
    searchLogOnce("error", "search.index.missing", "本地无 bm25.json", { file: INDEX_FILES.bm25 });
    return null;
  }
  if (bm25Buf.length > MAX_JSON_CHARS) {
    searchLog.warn("search.index.parse_error", {
      file: INDEX_FILES.bm25,
      bytes: bm25Buf.length,
      message: "bm25.json 超过 400MB，解析可能耗尽内存",
    });
  }

  const started = Date.now();
  try {
    const parsed = JSON.parse(bm25Buf.toString("utf8"));
    _bm25Index = parseBm25Index(parsed);
  } catch (err) {
    searchLog.error("search.index.parse_error", { file: INDEX_FILES.bm25, message: String((err as Error).message) });
    return null;
  }
  if (!_bm25Index) {
    searchLog.error("search.index.parse_error", { file: INDEX_FILES.bm25, message: "无法识别 BM25 索引格式" });
    return null;
  }
  _builtAt = _bm25Index.builtAt;
  _chunkMeta = parseChunkMeta(readLocalIndexFile(INDEX_FILES.chunksMeta));

  searchLogOnce("info", "search.index.loaded", `BM25 已加载：${_bm25Index.docCount} docs`, {
    file: INDEX_FILES.bm25,
    bytes: bm25Buf.length,
    count: _bm25Index.docCount,
    ms: Date.now() - started,
  });
  return _bm25Index;
}

const K1 = 1.5;
const B = 0.75;

export async function bm25Search(
  query: string,
  topK: number,
  filter?: SearchFilter,
): Promise<ScoredChunk[]> {
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
      const meta = _chunkMeta?.get(posting.id);
      if (filter && !chunkInScope(meta?.subjectId ?? "", filter)) continue;
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
      path: meta?.path ?? id.split("#")[0],
      subjectId: meta?.subjectId ?? "",
      subjectName: meta?.subjectName ?? "",
      categoryId: meta?.categoryId ?? "",
      itemId: meta?.itemId ?? "",
      title: meta?.title ?? "",
      chunkIndex: meta?.chunkIndex ?? 0,
      text: meta?.text ?? "",
      score,
    };
  });
}

export async function isBM25IndexLoaded(): Promise<boolean> {
  return (await loadIndexAsync()) !== null;
}

export async function getBm25BuiltAt(): Promise<string> {
  await loadIndexAsync();
  return _builtAt;
}

function resetBm25IndexCache(): void {
  _bm25Index = null;
  _chunkMeta = null;
  _loadAttempted = false;
  _builtAt = "";
}
