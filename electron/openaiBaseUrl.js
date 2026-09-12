"use strict";

// 与 lib/ai/openaiBaseUrl.ts 保持同一实现；Electron 主进程是 CJS，不能直接 import TS。
// 行为由 lib/ai/openaiBaseUrl.test.ts 对照两边输出锁死。
function normalizeOpenAIBaseUrl(url) {
  const trimmed = String(url ?? "").trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  return /\/v1$/i.test(trimmed) ? trimmed : `${trimmed}/v1`;
}

module.exports = { normalizeOpenAIBaseUrl };
