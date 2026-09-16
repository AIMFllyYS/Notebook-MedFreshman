import assert from "node:assert/strict";
import { test } from "node:test";
import { GET } from "@/app/api/global-search/route";

function request(q: string, subjectId?: string) {
  const params = new URLSearchParams({ q });
  if (subjectId) params.set("subjectId", subjectId);
  return new Request(`https://app.invalid/api/global-search?${params}`) as unknown as Parameters<typeof GET>[0];
}

test("GET /api/global-search 按科目返回正文命中", async () => {
  const res = await GET(request("被覆上皮", "histology"));
  assert.equal(res.status, 200);
  const body = (await res.json()) as { subjectId: string; hits: Array<{ snippet: string; subjectId: string }> };
  assert.equal(body.subjectId, "histology");
  assert.ok(body.hits.length > 0);
  assert.ok(body.hits.every((hit) => hit.subjectId === "histology"));
  assert.ok(body.hits.some((hit) => hit.snippet.includes("被覆上皮")));
});

test("GET /api/global-search 拒绝非法科目，空查询返回空", async () => {
  const bad = await GET(request("被覆上皮", "../etc"));
  assert.equal(bad.status, 400);
  const empty = await GET(request("", "histology"));
  assert.equal(empty.status, 200);
  assert.deepEqual(await empty.json(), { subjectId: "histology", hits: [] });
});
