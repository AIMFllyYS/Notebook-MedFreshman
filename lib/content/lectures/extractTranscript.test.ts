import assert from "node:assert/strict";
import { test } from "node:test";
import {
  chunkKeep,
  extractTranscriptBlocks,
  formatTranscriptBlock,
  normalizeForCoverage,
  parseTranscriptTurns,
} from "@/lib/content/lectures/extractTranscript";

const SAMPLE = [
  "@说话人 1  01:09",
  "同学们好，我们开始上课。今天讲萃取。",
  "",
  "@说话人 2  01:30",
  "老师，萃取和反萃取方向相反吗？",
  "",
  "@说话人 1  01:42",
  "对，水相到有机相是萃取，反过来是反萃取。",
].join("\n");

test("按发言轮次解析，保留说话人与时间戳", () => {
  const turns = parseTranscriptTurns(SAMPLE);
  assert.equal(turns.length, 3);
  assert.equal(turns[0].speaker, "1");
  assert.equal(turns[0].stamp, "01:09");
  assert.equal(turns[1].speaker, "2");
});

test("切块保留说话人/时间戳前缀", () => {
  const blocks = extractTranscriptBlocks(SAMPLE);
  assert.equal(blocks.length, 3);
  const first = formatTranscriptBlock(blocks[0]);
  assert.ok(first.startsWith("@说话人 1 01:09"));
  assert.ok(first.includes("萃取"));
});

test("长发言二次切分后拼接与原文逐字相等（无损）", () => {
  const long = "@说话人 1  00:01\n" + "句子。".repeat(500);
  const blocks = extractTranscriptBlocks(long, 120);
  assert.ok(blocks.length > 1);
  const joinedBody = blocks.map((b) => b.text).join("");
  assert.equal(normalizeForCoverage(joinedBody), normalizeForCoverage(long.split("\n").slice(1).join("\n")));
});

test("chunkKeep 任意长度切片 join 后等于原文", () => {
  const s = "a".repeat(250) + "。" + "b".repeat(250) + "！" + "c".repeat(250);
  for (const max of [1, 30, 100, 1000]) {
    const parts = chunkKeep(s, max);
    assert.equal(parts.join(""), s, `max=${max} 应无损`);
  }
});
