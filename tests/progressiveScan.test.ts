import assert from "node:assert/strict";
import { test } from "node:test";
import { scanInChunks, SEARCH_CHUNK_SIZE } from "@/lib/search/progressiveScan";

test("scanInChunks 按 chunk 让出主线程，不一次扫完整表", async () => {
  let yields = 0;
  const items = Array.from({ length: 25 }, (_, i) => i);
  const hits = await scanInChunks(items, (n) => (n % 2 === 0 ? n : null), {
    chunkSize: 10,
    yieldFn: async () => {
      yields += 1;
    },
  });

  assert.deepEqual(hits, [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]);
  assert.equal(yields, 2, "25 条、每片 10 条应在第 1、2 片后各让出一次，最后一片不再 yield");
});

test("scanInChunks 支持中止，避免旧查询继续占主线程", async () => {
  const ac = new AbortController();
  ac.abort();
  const hits = await scanInChunks([1, 2, 3, 4], (n) => n, {
    chunkSize: 2,
    signal: ac.signal,
    yieldFn: async () => {
      throw new Error("aborted scan should not yield");
    },
  });
  assert.deepEqual(hits, []);
});

test("默认分片大小是性能契约的一部分", () => {
  assert.ok(SEARCH_CHUNK_SIZE > 0 && SEARCH_CHUNK_SIZE <= 32);
});
