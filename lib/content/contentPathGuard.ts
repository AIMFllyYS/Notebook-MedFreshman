import fs from "node:fs";
import path from "node:path";

/**
 * 内容路径标识符白名单。
 * 对照 readQuiz 的 `^[a-zA-Z0-9_-]+$`，额外允许单个 `.`（小节 id 如 1.1 / ppt-15.1）。
 * `..`、路径分隔符、空串一律拒绝。
 */
const CONTENT_SEGMENT_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?$/;

export function isSafeContentSegment(value: string): boolean {
  if (!value) return false;
  if (value.includes("..")) return false;
  if (/[\\/\0]/.test(value)) return false;
  return CONTENT_SEGMENT_RE.test(value);
}

export function isSafeContentRef(subjectId: string, categoryId: string, itemId: string): boolean {
  return isSafeContentSegment(subjectId) && isSafeContentSegment(categoryId) && isSafeContentSegment(itemId);
}

/** 解析后的绝对路径必须落在 root 之内（含文件本身，不含 root 目录自身）。 */
export function isResolvedPathInside(filePath: string, rootDir: string): boolean {
  const resolved = path.resolve(filePath);
  const root = path.resolve(rootDir);
  const rel = path.relative(root, resolved);
  return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel);
}

/**
 * 内容读盘入口。测试可替换 readFileSync，避免 mock 全局 `node:fs`。
 * 生产路径走真实 fs；调用方必须先通过白名单 / 内容树校验。
 */
export const contentIo = {
  readFileSync(filePath: string, encoding: BufferEncoding): string {
    return fs.readFileSync(filePath, encoding);
  },
};
