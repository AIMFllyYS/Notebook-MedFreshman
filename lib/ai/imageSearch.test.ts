import assert from "node:assert/strict";
import { test } from "node:test";

// imageSearch 的纯函数部分（enhanceQueryForEducation / selectBestImages）未导出，
// 只能通过 searchImages 间接测试。但 searchImages 依赖网络 + API key，
// 所以这里只测试导出的接口类型和边界行为。

// 由于 imageSearch 模块在加载时读取 process.env.UNSPLASH_ACCESS_KEY，
// 且 searchImages 在无 key 时返回空数组，我们可以测试这个边界。

test("searchImages：无 API key 时返回空数组", async () => {
  const { searchImages } = await import("./imageSearch.ts");
  // 测试环境无 UNSPLASH_ACCESS_KEY
  const results = await searchImages("test query");
  assert.deepEqual(results, []);
});

test("searchImages：空 query 返回空数组", async () => {
  const { searchImages } = await import("./imageSearch.ts");
  const results = await searchImages("");
  assert.deepEqual(results, []);
});

test("trackPhotoDownload：空 URL 时不抛错", async () => {
  const { trackPhotoDownload } = await import("./imageSearch.ts");
  await trackPhotoDownload("");
  // 不抛错即通过
});
