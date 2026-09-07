// 检索索引文件 I/O：只认本地 content/.index/（自托管 / 桌面打包产物）。
// 不再从 COS /tmp 回退——陈旧远端索引会把学年过滤后的结果静默打空。
import * as fs from "node:fs";
import * as path from "node:path";

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

export function getLocalIndexDir(): string {
  return process.env.SEARCH_INDEX_DIR || path.join(process.cwd(), "content", ".index");
}

export function localIndexFile(name: string): string {
  return path.join(getLocalIndexDir(), name);
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
