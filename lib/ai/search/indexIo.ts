// 检索索引文件 I/O：本地 content/.index → /tmp 缓存 → COS。
// 硬约束：本地已经有新一代 BM25/chunks-meta 时，禁止再用 COS 上另一代 vectors
// （2026-06 的 COS 向量早于大二教材接入，混用会拖死首次 searchNotes 并污染排序）。
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

export const LOCAL_INDEX_DIR = path.join(process.cwd(), "content", ".index");
export const TMP_INDEX_DIR = path.join(os.tmpdir(), ".search-index");

export const INDEX_FILES = {
  bm25: "bm25.json",
  chunksMeta: "chunks-meta.json",
  vectorsBin: "vectors.bin",
  vectorsIds: "vectors.ids.json",
  vectorsJson: "vectors.json",
  manifest: "manifest.json",
} as const;

export interface SearchIndexManifest {
  version: 2;
  builtAt: string;
  embeddingModel: string;
  dimension: number;
  chunkCount: number;
  vectorCount: number;
  contentHash: string;
  files: string[];
}

export function getCosIndexBaseUrl(): string {
  return process.env.COS_INDEX_BASE_URL || "";
}

export function localIndexFile(name: string): string {
  return path.join(LOCAL_INDEX_DIR, name);
}

export function tmpIndexFile(name: string): string {
  return path.join(TMP_INDEX_DIR, name);
}

export function readFileIfExists(filePath: string): Buffer | null {
  try {
    return fs.readFileSync(filePath);
  } catch {
    return null;
  }
}

export function hasLocalSearchIndex(): boolean {
  return (
    fs.existsSync(localIndexFile(INDEX_FILES.chunksMeta)) ||
    fs.existsSync(localIndexFile(INDEX_FILES.bm25))
  );
}

export function readLocalIndexFile(filename: string): Buffer | null {
  return readFileIfExists(localIndexFile(filename));
}

/** 无本地索引时（EdgeOne）才读 /tmp 缓存。 */
export function readLocalOrTmp(filename: string): Buffer | null {
  const local = readLocalIndexFile(filename);
  if (local) return local;
  if (hasLocalSearchIndex()) return null;
  return readFileIfExists(tmpIndexFile(filename));
}

export function shouldFetchIndexFromCos(): boolean {
  return !hasLocalSearchIndex() && !!getCosIndexBaseUrl();
}

function cosUrl(filename: string): string {
  const base = getCosIndexBaseUrl();
  return base.endsWith("/") ? base + filename : `${base}/${filename}`;
}

export async function downloadFromCosToFile(filename: string, dest: string): Promise<boolean> {
  const base = getCosIndexBaseUrl();
  if (!base) return false;
  const resp = await fetch(cosUrl(filename));
  if (!resp.ok || !resp.body) return false;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const nodeStream = Readable.fromWeb(resp.body as import("node:stream/web").ReadableStream);
  await pipeline(nodeStream, fs.createWriteStream(dest));
  return true;
}

export async function readIndexFile(filename: string): Promise<Buffer | null> {
  const local = readLocalOrTmp(filename);
  if (local) return local;
  if (!shouldFetchIndexFromCos()) return null;
  try {
    const dest = tmpIndexFile(filename);
    const ok = await downloadFromCosToFile(filename, dest);
    if (!ok) return null;
    return readFileIfExists(dest);
  } catch {
    return null;
  }
}

export function parseManifest(raw: Buffer | null): SearchIndexManifest | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw.toString("utf8")) as SearchIndexManifest;
    if (parsed?.version !== 2) return null;
    return parsed;
  } catch {
    return null;
  }
}

let _logged = false;

export function logSearchIndexOnce(message: string): void {
  if (_logged) return;
  _logged = true;
  console.info(`[search] ${message}`);
}

/** 测试用：允许再次打印状态。 */
export function resetSearchIndexLog(): void {
  _logged = false;
}
