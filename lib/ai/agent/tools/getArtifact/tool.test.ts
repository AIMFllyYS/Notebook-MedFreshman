import assert from "node:assert/strict";
import { test } from "node:test";
import { createGetArtifactTool } from "./tool.ts";
import type { GetArtifactOutput } from "./types.ts";

async function exec(id: string, catalog = [{
  id: "art_1",
  title: "滑块",
  summary: "看参数",
  html: "<html><body>FULL</body></html>",
}]): Promise<GetArtifactOutput> {
  const tool = createGetArtifactTool(catalog);
  return tool.execute!({ id }, {
    toolCallId: "t1",
    messages: [],
    abortSignal: new AbortController().signal,
    context: {},
  }) as Promise<GetArtifactOutput>;
}

test("getArtifact：按 id 取回全文", async () => {
  const found = await exec("art_1");
  assert.equal(found.found, true);
  assert.match(found.text, /FULL/);
  assert.equal(found.artifactId, "art_1");
});

test("getArtifact：未知 id 列出可用列表", async () => {
  const miss = await exec("art_missing");
  assert.equal(miss.found, false);
  assert.match(miss.text, /art_1/);
});
